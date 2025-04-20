import { type NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import type { LeaderboardEntry } from "@/lib/types";

const getFilePath = () => {
  const getDateString = (date: Date) =>
    date
      .toISOString()
      .split("T")[0]
      .replace(/-/g, "_")
      .split("_")
      .slice(1)
      .concat(date.toISOString().split("T")[0].split("-")[0])
      .join("_");

  const today = new Date();
  const todayString = getDateString(today);

  let filePath = path.join(
    process.cwd(),
    "public",
    "leaderboards",
    `succinct_leaderboard@${todayString}.csv`
  );

  if (!fs.existsSync(filePath)) {
    const leaderboardDir = path.join(process.cwd(), "public", "leaderboards");
    const files = fs
      .readdirSync(leaderboardDir)
      .filter(
        (file) =>
          file.startsWith("succinct_leaderboard@") && file.endsWith(".csv")
      )
      .sort((a, b) => {
        const dateA = new Date(
          a.split("@")[1].replace(".csv", "").replace(/_/g, "-")
        );
        const dateB = new Date(
          b.split("@")[1].replace(".csv", "").replace(/_/g, "-")
        );
        return dateB.getTime() - dateA.getTime();
      });

    if (files.length > 0) {
      filePath = path.join(leaderboardDir, files[0]);
    } else {
      throw new Error("No leaderboard files found.");
    }
  }

  return filePath;
};

const filePath = getFilePath();

const loadLeaderboardData = async (): Promise<LeaderboardEntry[]> => {
  const leaderboardData: LeaderboardEntry[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row: any) => {
        leaderboardData.push({
          rank: row["Rank"],
          name: row["Name"],
          invitedBy: row["Invited By"],
          proofs: row["Proofs"],
          cycles: row["Cycles"],
          stars: row["Stars"],
        });
      })
      .on("end", () => {
        resolve(leaderboardData);
      })
      .on("error", (error: any) => {
        reject(error);
      });
  });
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const username = searchParams.get("username");
  const page = searchParams.get("page");
  const entriesPerPage = searchParams.get("entriesPerPage");
  const limit = searchParams.get("limit");

  try {
    const data = await loadLeaderboardData();

    if (action === "getByUsername" && username) {
      const normalizedUsername =
        username.startsWith("@") || username.startsWith("0x")
          ? username
          : `@${username}`;
      const result = data.find(
        (entry) => entry.name.toLowerCase() === normalizedUsername.toLowerCase()
      );

      if (!result) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const averageProofs =
        data.reduce(
          (sum, entry) => sum + Number(entry.proofs.replace(/,/g, "")),
          0
        ) / data.length;
      const averageStars =
        data.reduce(
          (sum, entry) => sum + Number(entry.stars.replace(/,/g, "")),
          0
        ) / data.length;
      const averageCycles =
        data.reduce(
          (sum, entry) => sum + Number(entry.cycles.replace(/,/g, "")),
          0
        ) / data.length;

      const proofs = Math.min(
        Math.max(
          (Number(result.proofs.replace(/,/g, "")) / averageProofs) * 20,
          1
        ),
        100
      );
      const stars = Math.min(
        Math.max(
          (Number(result.stars.replace(/,/g, "")) / averageStars) * 20,
          1
        ),
        100
      );
      const cycles = Math.min(
        Math.max(
          (Number(result.cycles.replace(/,/g, "")) / averageCycles) * 20,
          1
        ),
        100
      );

      const calculateUserTopPercent = (
        userData: LeaderboardEntry,
        allUsersData: LeaderboardEntry[]
      ) => {
        const userRank = Number(userData.rank.replace(/[^0-9]/g, ""));
        const totalUsers = allUsersData.length;

        const topPercent = (userRank / totalUsers) * 100;

        return topPercent > 1
          ? Math.floor(topPercent).toString()
          : userRank <= 3
          ? topPercent.toFixed(3)
          : topPercent.toFixed(2);
      };

      const topPercentage = calculateUserTopPercent(result, data);

      console.log("Top percentage:", topPercentage);

      return NextResponse.json(
        {
          data: result,
          progress: {
            proofs,
            stars,
            cycles,
          },
          topPercentage,
        },
        { status: 200 }
      );
    }

    if (action === "getByPage" && page && entriesPerPage) {
      const startIndex =
        (Number.parseInt(page) - 1) * Number.parseInt(entriesPerPage);
      const pagedData = data.slice(
        startIndex,
        startIndex + Number.parseInt(entriesPerPage)
      );

      if (pagedData.length === 0) {
        return NextResponse.json(
          { error: "No data found for the page" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          data: pagedData,
          total: data.length,
        },
        { status: 200 }
      );
    }

    if (action === "topInvitersLeaderboardByPage" && page && entriesPerPage) {
      const inviters = data.reduce((acc: any, entry: LeaderboardEntry) => {
        if (entry.invitedBy) {
          if (acc[entry.invitedBy]) {
            acc[entry.invitedBy].push(entry);
          } else {
            acc[entry.invitedBy] = [entry];
          }
        }
        return acc;
      }, {});

      const sortedInviters = Object.keys(inviters).sort((a, b) => {
        return inviters[b].length - inviters[a].length;
      });

      const startIndex =
        (Number.parseInt(page) - 1) * Number.parseInt(entriesPerPage);
      const pagedData = sortedInviters
        .slice(startIndex, startIndex + Number.parseInt(entriesPerPage))
        .map((inviter, index) => {
          return {
            rank: startIndex + index + 1,
            inviter,
            count: inviters[inviter].length,
          };
        });

      if (pagedData.length === 0) {
        return NextResponse.json(
          { error: "No data found for the page" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          data: pagedData,
          total: sortedInviters.length,
        },
        { status: 200 }
      );
    }

    if (action === "getStarRanges") {
      const ranges = [
        { range: "1-2,500", count: 0 },
        { range: "2,501-5,000", count: 0 },
        { range: "5,001-10,000", count: 0 },
        { range: "10,001+", count: 0 },
      ];

      data.forEach((entry: LeaderboardEntry) => {
        if (entry.stars) {
          const stars = Number.parseInt(entry.stars.replace(/,/g, ""));
          if (stars <= 2500) ranges[0].count++;
          else if (stars <= 5000) ranges[1].count++;
          else if (stars <= 10000) ranges[2].count++;
          else ranges[3].count++; // Add count for 10,001+ range
        }
      });

      return NextResponse.json(ranges, { status: 200 });
    }

    if (action === "getNetworkStats") {
      const totalProvers = data.length;
      const totalStars = data.reduce(
        (sum, entry) => sum + Number(entry.stars.replace(/,/g, "")),
        0
      );
      const totalCycles = data.reduce(
        (sum, entry) => sum + Number(entry.cycles.replace(/,/g, "")),
        0
      );
      const totalProofs = data.reduce(
        (sum, entry) => sum + Number(entry.proofs.replace(/,/g, "")),
        0
      );

      return NextResponse.json(
        {
          totalProvers,
          totalStars,
          totalCycles,
          totalProofs,
        },
        { status: 200 }
      );
    }

    if (action === "getTotalEntries") {
      const totalEntries = data.length;
      return NextResponse.json({ totalEntries }, { status: 200 });
    }

    if (action === "getTopUsersByProofsByPage" && page && entriesPerPage) {
      const sortedData = data
        .map((entry) => ({
          ...entry,
          proofs: Number(entry.proofs.replace(/,/g, "")),
        }))
        .sort((a, b) => b.proofs - a.proofs)
        .map((entry, index) => ({
          rank: index + 1,
          name: entry.name,
          proofs: entry.proofs.toLocaleString(),
        }));

      const startIndex =
        (Number.parseInt(page) - 1) * Number.parseInt(entriesPerPage);
      const pagedData = sortedData.slice(
        startIndex,
        startIndex + Number.parseInt(entriesPerPage)
      );

      if (pagedData.length === 0) {
        return NextResponse.json(
          { error: "No data found for the page" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          data: pagedData,
          total: sortedData.length,
        },
        { status: 200 }
      );
    }

    // Default: return all data
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Error reading leaderboard data" },
      { status: 500 }
    );
  }
}
