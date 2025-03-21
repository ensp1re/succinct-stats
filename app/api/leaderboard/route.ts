import { type NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import type { LeaderboardEntry } from "@/lib/types";

const filePath = path.join(process.cwd(), "public", "succinct_leaderboard.csv");

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
      const normalizedUsername = username.startsWith("@")
        ? username
        : `@${username}`;
      const result = data.find(
        (entry) => entry.name.toLowerCase() === normalizedUsername.toLowerCase()
      );

      if (!result) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json(result, { status: 200 });
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

    if (action === "getTopPerformers") {
      const top = data.slice(0, Number.parseInt(limit || "5"));
      return NextResponse.json(top, { status: 200 });
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
