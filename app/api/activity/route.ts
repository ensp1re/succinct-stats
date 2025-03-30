import { type NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import {
  format,
  parse as parseDate,
  isWithinInterval,
  addDays,
} from "date-fns";

// Define the structure of a leaderboard entry from CSV
interface LeaderboardEntry {
  Rank: string;
  Name: string;
  "Invited By": string;
  Proofs: string;
  Cycles: string;
  Stars: string;
}

// Define the structure of our processed daily activity data
interface DailyActivity {
  day: string;
  date: string;
  newUsers: number;
  starsEarned: number;
  proofsGenerated: number;
  activeUsers: number;
  topEarner: string;
  topEarnerStars: number;
}

// Define the structure of our API response
interface ActivityResponse {
  success: boolean;
  data?: DailyActivity[];
  error?: string;
}

// Helper function to parse a CSV file
function parseCSVFile(filePath: string): LeaderboardEntry[] {
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    return records;
  } catch (error) {
    console.error(`Error parsing CSV file ${filePath}:`, error);
    return [];
  }
}

// Helper function to get available CSV files within a date range
function getCSVFilesInRange(startDate: Date, endDate: Date): string[] {
  const dataDir = path.join(process.cwd(), "public", "leaderboards");

  // Ensure the data directory exists
  if (!fs.existsSync(dataDir)) {
    console.error("Data directory does not exist:", dataDir);
    return [];
  }

  // Get all CSV files in the directory
  const files = fs
    .readdirSync(dataDir)
    .filter(
      (file) =>
        file.startsWith("succinct_leaderboard@") && file.endsWith(".csv")
    );

  // Filter files by date range
  return files
    .filter((file) => {
      try {
        // Extract date from filename (format: succinct_leaderboard@MM_DD_YYYY.csv)
        const dateStr = file
          .replace("succinct_leaderboard@", "")
          .replace(".csv", "");
        const [month, day, year] = dateStr.split("_").map(Number);
        const fileDate = new Date(year, month - 1, day); // month is 0-indexed in JS Date

        // Check if the file date is within our range
        return isWithinInterval(fileDate, { start: startDate, end: endDate });
      } catch (error) {
        console.error(`Error parsing date from filename ${file}:`, error);
        return false;
      }
    })
    .map((file) => path.join(dataDir, file));
}

// Helper function to calculate daily metrics from leaderboard data
function calculateDailyMetrics(
  currentDayData: LeaderboardEntry[],
  previousDayData: LeaderboardEntry[] | null
): {
  newUsers: number;
  starsEarned: number;
  proofsGenerated: number;
  activeUsers: number;
  topEarner: string;
  topEarnerStars: number;
} {
  // Calculate new users (users in current day not in previous day)
  let newUsers = 0;
  if (previousDayData) {
    const previousUsernames = new Set(
      previousDayData.map((entry) => entry.Name)
    );
    // Only count users that are in current day but not in previous day
    newUsers = currentDayData.filter(
      (entry) => !previousUsernames.has(entry.Name)
    ).length;
  } else {
    // If no previous day data, we can't accurately determine new users
    newUsers = 0;
  }

  // Calculate total stars earned for the day and find top earner
  let starsEarned = 0;
  let topEarner = { name: "N/A", stars: 0, increase: 0 };

  if (previousDayData) {
    const previousStarsByUser = new Map();
    previousDayData.forEach((entry) => {
      previousStarsByUser.set(
        entry.Name,
        Number.parseInt(entry.Stars.replace(/,/g, ""), 10)
      );
    });

    currentDayData.forEach((entry) => {
      const currentStars = Number.parseInt(entry.Stars.replace(/,/g, ""), 10);
      const previousStars = previousStarsByUser.get(entry.Name) || 0;
      const starIncrease = Math.max(0, currentStars - previousStars);

      // Add to total stars earned
      starsEarned += starIncrease;

      // Check if this user earned more stars than the current top earner
      if (starIncrease > topEarner.increase) {
        topEarner = {
          name: entry.Name,
          stars: currentStars,
          increase: starIncrease,
        };
      }
    });
  } else {
    // If no previous day data, we can't accurately calculate stars earned
    starsEarned = 0;

    // Just use the user with the highest total stars as the top earner
    currentDayData.forEach((entry) => {
      const stars = Number.parseInt(entry.Stars.replace(/,/g, ""), 10);
      if (stars > topEarner.stars) {
        topEarner = { name: entry.Name, stars, increase: 0 };
      }
    });
  }

  // Calculate proofs generated for the day
  let proofsGenerated = 0;
  if (previousDayData) {
    const previousProofsByUser = new Map();
    previousDayData.forEach((entry) => {
      previousProofsByUser.set(
        entry.Name,
        Number.parseInt(entry.Proofs.replace(/,/g, ""), 10)
      );
    });

    currentDayData.forEach((entry) => {
      const currentProofs = Number.parseInt(entry.Proofs.replace(/,/g, ""), 10);
      const previousProofs = previousProofsByUser.get(entry.Name) || 0;
      proofsGenerated += Math.max(0, currentProofs - previousProofs);
    });
  } else {
    // If no previous day data, we can't accurately calculate proofs generated
    proofsGenerated = 0;
  }

  // Active users is simply the count of users in the current day
  const activeUsers = currentDayData.length;

  return {
    newUsers,
    starsEarned,
    proofsGenerated,
    activeUsers,
    topEarner: topEarner.name,
    topEarnerStars: topEarner.stars,
  };
}

// Update the GET handler to always return a complete week (Monday to Sunday)
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");

    // Validate date parameters
    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        {
          success: false,
          error: "Both startDate and endDate are required",
        } as ActivityResponse,
        { status: 400 }
      );
    }

    // Parse dates
    let startDate = parseDate(startDateStr, "yyyy-MM-dd", new Date());
    let endDate = parseDate(endDateStr, "yyyy-MM-dd", new Date());

    // Adjust to get a complete week (Monday to Sunday)
    // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const startDay = startDate.getDay();

    // Adjust to Monday (if not already Monday)
    // If Sunday (0), go back 6 days to previous Monday
    // If any other day, go back (day - 1) days to reach Monday
    const daysToSubtract = startDay === 0 ? 6 : startDay - 1;
    startDate = addDays(startDate, -daysToSubtract);

    // Set end date to Sunday (6 days after Monday)
    endDate = addDays(startDate, 6);

    // Get CSV files for the date range
    const csvFiles = getCSVFilesInRange(startDate, endDate);

    // If no files found, return empty array for each day
    if (csvFiles.length === 0) {
      const emptyData: DailyActivity[] = [];

      // Create empty data for each day in the week
      for (let i = 0; i < 7; i++) {
        const currentDate = addDays(startDate, i);
        emptyData.push({
          day: format(currentDate, "EEE"),
          date: format(currentDate, "yyyy-MM-dd"),
          newUsers: 0,
          starsEarned: 0,
          proofsGenerated: 0,
          activeUsers: 0,
          topEarner: "N/A",
          topEarnerStars: 0,
        });
      }

      return NextResponse.json({
        success: true,
        data: emptyData,
      } as ActivityResponse);
    }

    // Process each day in the week
    const activityData: DailyActivity[] = [];
    let previousDayData: LeaderboardEntry[] | null = null;

    // For each day in the week (Monday to Sunday)
    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(startDate, i);
      const formattedDate = format(currentDate, "MM_dd_yyyy");
      const expectedFilename = `succinct_leaderboard@${formattedDate}.csv`;
      const expectedFilePath = path.join(
        process.cwd(),
        "data",
        expectedFilename
      );

      // Check if we have data for this day
      let currentDayData: LeaderboardEntry[] = [];
      if (fs.existsSync(expectedFilePath)) {
        currentDayData = parseCSVFile(expectedFilePath);
      } else {
        // If no data for this specific day, use the closest previous day's data
        const closestPreviousFile = csvFiles
          .filter((file) => {
            const fileDate = parseDate(
              file.split("@")[1].replace(".csv", ""),
              "MM_dd_yyyy",
              new Date()
            );
            return fileDate <= currentDate;
          })
          .sort((a, b) => {
            const dateA = parseDate(
              a.split("@")[1].replace(".csv", ""),
              "MM_dd_yyyy",
              new Date()
            );
            const dateB = parseDate(
              b.split("@")[1].replace(".csv", ""),
              "MM_dd_yyyy",
              new Date()
            );
            return dateB.getTime() - dateA.getTime(); // Sort descending
          })[0];

        if (closestPreviousFile) {
          currentDayData = parseCSVFile(closestPreviousFile);
        }
      }

      // Calculate metrics for this day
      if (currentDayData.length > 0) {
        const metrics = calculateDailyMetrics(currentDayData, previousDayData);

        // Add to activity data
        activityData.push({
          day: format(currentDate, "EEE"), // Day abbreviation (Mon, Tue, etc.)
          date: format(currentDate, "yyyy-MM-dd"),
          ...metrics,
        });

        // Update previous day data for next iteration
        previousDayData = currentDayData;
      } else {
        // If no data available, add placeholder with zeros
        activityData.push({
          day: format(currentDate, "EEE"),
          date: format(currentDate, "yyyy-MM-dd"),
          newUsers: 0,
          starsEarned: 0,
          proofsGenerated: 0,
          activeUsers: 0,
          topEarner: "N/A",
          topEarnerStars: 0,
        });
      }
    }

    // Return the processed activity data
    return NextResponse.json({
      success: true,
      data: activityData,
    } as ActivityResponse);
  } catch (error) {
    console.error("Error processing activity data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      } as ActivityResponse,
      { status: 500 }
    );
  }
}
