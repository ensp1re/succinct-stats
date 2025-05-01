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

// Helper function to safely parse numeric values
function safeParseNumber(value: string | undefined): number {
  if (!value || typeof value !== "string") return 0;
  // Remove commas and non-numeric characters except for decimal points and signs
  const cleanedValue = value.replace(/[^\d.-]/g, "");
  const parsedValue = Number(cleanedValue);
  return isNaN(parsedValue) ? 0 : Math.floor(parsedValue); // Ensure integer output
}

const filePath = getFilePath();

const loadLeaderboardData = async (): Promise<LeaderboardEntry[]> => {
  const leaderboardData: LeaderboardEntry[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row: any) => {
        // Sanitize and validate numeric fields
        const entry: LeaderboardEntry = {
          rank: row["Rank"] || "",
          name: row["Name"] || "",
          invitedBy: row["Invited By"] || "",
          proofs: safeParseNumber(row["Proofs"]).toString(),
          cycles: safeParseNumber(row["Cycles"]).toString(),
          stars: safeParseNumber(row["Stars"]).toString(),
        };
        leaderboardData.push(entry);
      })
      .on("end", () => {
        // Log sample data for debugging
        if (leaderboardData.length > 0) {
          console.log("Sample leaderboard entry:", leaderboardData[0]);
        }
        resolve(leaderboardData);
      })
      .on("error", (error: any) => {
        console.error("Error reading CSV:", error);
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

      // Calculate averages using safeParseNumber
      const averageProofs =
        data.reduce((sum, entry) => sum + safeParseNumber(entry.proofs), 0) /
        (data.length || 1); // Avoid division by zero
      const averageStars =
        data.reduce((sum, entry) => sum + safeParseNumber(entry.stars), 0) /
        (data.length || 1);
      const averageCycles =
        data.reduce((sum, entry) => sum + safeParseNumber(entry.cycles), 0) /
        (data.length || 1);

      // Calculate progress metrics
      const userProofs = safeParseNumber(result.proofs);
      const userStars = safeParseNumber(result.stars);
      const userCycles = safeParseNumber(result.cycles);

      const proofs = Math.min(
        Math.max(averageProofs > 0 ? (userProofs / averageProofs) * 20 : 0, 1),
        100
      );
      const stars = Math.min(
        Math.max(averageStars > 0 ? (userStars / averageStars) * 20 : 0, 1),
        100
      );
      const cycles = Math.min(
        Math.max(averageCycles > 0 ? (userCycles / averageCycles) * 20 : 0, 1),
        100
      );

      // Log for debugging
      console.log({
        user: result.name,
        userStars,
        averageStars,
        starsProgress: stars,
        userProofs,
        averageProofs,
        proofsProgress: proofs,
        userCycles,
        averageCycles,
        cyclesProgress: cycles,
      });

      const calculateUserTopPercent = (
        userData: LeaderboardEntry,
        allUsersData: LeaderboardEntry[]
      ) => {
        const userRank = safeParseNumber(userData.rank);
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
        (safeParseNumber(page) - 1) * safeParseNumber(entriesPerPage);
      const pagedData = data.slice(
        startIndex,
        startIndex + safeParseNumber(entriesPerPage)
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
        (safeParseNumber(page) - 1) * safeParseNumber(entriesPerPage);
      const pagedData = sortedInviters
        .slice(startIndex, startIndex + safeParseNumber(entriesPerPage))
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
        const stars = safeParseNumber(entry.stars);
        if (stars <= 2500) ranges[0].count++;
        else if (stars <= 5000) ranges[1].count++;
        else if (stars <= 10000) ranges[2].count++;
        else ranges[3].count++; // Add count for 10,001+ range
      });

      // Log for debugging
      console.log("Star ranges:", ranges);

      return NextResponse.json(ranges, { status: 200 });
    }

    if (action === "getNetworkStats") {
      const totalProvers = data.length;
      const totalStars = data.reduce(
        (sum, entry) => sum + safeParseNumber(entry.stars),
        0
      );
      const totalCycles = data.reduce(
        (sum, entry) => sum + safeParseNumber(entry.cycles),
        0
      );
      const totalProofs = data.reduce(
        (sum, entry) => sum + safeParseNumber(entry.proofs),
        0
      );

      // Log for debugging
      console.log({
        totalProvers,
        totalStars,
        totalCycles,
        totalProofs,
      });

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
          proofs: safeParseNumber(entry.proofs),
        }))
        .sort((a, b) => b.proofs - a.proofs)
        .map((entry, index) => ({
          rank: index + 1,
          name: entry.name,
          proofs: entry.proofs.toLocaleString(),
        }));

      const startIndex =
        (safeParseNumber(page) - 1) * safeParseNumber(entriesPerPage);
      const pagedData = sortedData.slice(
        startIndex,
        startIndex + safeParseNumber(entriesPerPage)
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
