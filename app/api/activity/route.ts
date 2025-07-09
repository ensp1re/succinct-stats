import { type NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { format, parse as parseDate, addDays } from "date-fns";

interface LeaderboardEntry {
  Rank: string;
  Name: string;
  "Invited By": string;
  Proofs: string;
  Cycles: string;
  Stars: string;
}

interface DailyActivity {
  day: string;
  date: string;
  newUsers: number;
  starsEarned: number;
  proofsGenerated: number;
  activeUsers: number;
  topEarner: string;
  topEarnerStars: number;
  hasActualData: boolean;
  totalStars?: number;
  previousTotalStars?: number;
}

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
      relax_quotes: true,
      relax_column_count: true,
    });

    // Log a sample record for debugging
    if (records.length > 0) {
      console.log("Sample record:", records[0]);
    }

    return records;
  } catch (error) {
    console.error(`Error parsing CSV file ${filePath}:`, error);
    return [];
  }
}

// Helper function to safely parse numeric values from strings with commas
function safeParseInt(value: string): number {
  if (!value || typeof value !== "string") return 0;
  // Remove commas and non-numeric characters except for decimal points
  const cleanedValue = value.replace(/[^\d.-]/g, "");
  // Use Number() as requested
  const parsedValue = Number(cleanedValue);
  return isNaN(parsedValue) ? 0 : Math.floor(parsedValue); // Ensure integer output
}

// Helper function to get all available CSV files
function getAllCSVFiles(): { path: string; date: Date }[] {
  const result: { path: string; date: Date }[] = [];

  // Check both possible directories
  const dataDirs = [
    path.join(process.cwd(), "data"),
    path.join(process.cwd(), "public", "leaderboards"),
  ];

  for (const dataDir of dataDirs) {
    // Skip if directory doesn't exist
    if (!fs.existsSync(dataDir)) continue;

    // Get all CSV files in the directory
    const files = fs
      .readdirSync(dataDir)
      .filter(
        (file) =>
          (file.startsWith("leaderboard@") ||
            file.startsWith("succinct_leaderboard@")) &&
          file.endsWith(".csv")
      );

    for (const file of files) {
      try {
        // Extract date from filename
        let dateStr;
        if (file.startsWith("leaderboard@")) {
          dateStr = file.replace("leaderboard@", "").replace(".csv", "");
        } else {
          dateStr = file
            .replace("succinct_leaderboard@", "")
            .replace(".csv", "");
        }

        // Parse date in MM_DD_YYYY format
        const [month, day, year] = dateStr.split("_").map(Number);
        const fileDate = new Date(year, month - 1, day);

        // Log for debugging
        console.log(
          `Parsed file: ${file}, Date: ${fileDate.toISOString().split("T")[0]}`
        );

        result.push({
          path: path.join(dataDir, file),
          date: fileDate,
        });
      } catch (error) {
        console.error(`Error parsing date from filename ${file}:`, error);
      }
    }
  }

  // Sort by date (oldest first)
  result.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Log all parsed files for debugging
  console.log(
    "All CSV files:",
    result.map((f) => ({
      path: path.basename(f.path),
      date: f.date.toISOString().split("T")[0],
    }))
  );

  return result;
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
  totalStars: number;
  previousTotalStars: number;
} {
  if (currentDayData.length === 0) {
    console.warn("No data parsed for current day, returning zero metrics");
    return {
      newUsers: 0,
      starsEarned: 0,
      proofsGenerated: 0,
      activeUsers: 0,
      topEarner: "N/A",
      topEarnerStars: 0,
      totalStars: 0,
      previousTotalStars: 0,
    };
  }

  console.log(`Current day entries: ${currentDayData.length}`);
  if (previousDayData) {
    console.log(`Previous day entries: ${previousDayData.length}`);
  }

  // Total users
  const totalUsersToday = currentDayData.length;
  const totalUsersYesterday = previousDayData ? previousDayData.length : 0;
  const newUsers = Math.max(0, totalUsersToday - totalUsersYesterday);

  // Calculate totals
  let totalStars = 0;
  let previousTotalStars = 0;
  let totalProofs = 0;
  let previousTotalProofs = 0;

  // Current day
  currentDayData.forEach((entry) => {
    const stars = safeParseInt(entry.Stars || "0"); // Use Stars field
    const proofs = safeParseInt(entry.Proofs || "0"); // Use Proofs field
    totalStars += stars;
    totalProofs += proofs;
  });

  // Previous day
  if (previousDayData) {
    previousDayData.forEach((entry) => {
      const stars = safeParseInt(entry.Stars || "0");
      const proofs = safeParseInt(entry.Proofs || "0");
      previousTotalStars += stars;
      previousTotalProofs += proofs;
    });
  }

  // Calculate differences
  const starsEarned = Math.max(0, totalStars - previousTotalStars);
  const proofsGenerated = Math.max(0, totalProofs - previousTotalProofs);

  if (totalProofs < previousTotalProofs) {
    console.warn(
      `Data inconsistency: totalProofs (${totalProofs}) is less than previousTotalProofs (${previousTotalProofs})`
    );
  }

  if (totalStars < previousTotalStars) {
    console.warn(
      `Data inconsistency: totalStars (${totalStars}) is less than previousTotalStars (${previousTotalStars})`
    );
  }

  // Log for debugging
  console.log({
    totalProofs,
    previousTotalProofs,
    proofsGenerated,
    totalStars,
    previousTotalStars,
    starsEarned,
    newUsers,
    totalUsersToday,
    totalUsersYesterday,
  });

  // Find top earner
  let topEarner = { name: "N/A", starsEarned: 0 };
  const previousStarsByUser = previousDayData
    ? new Map(
        previousDayData.map((entry) => [
          entry.Name,
          safeParseInt(entry.Stars || "0"),
        ])
      )
    : new Map();

  const userStarIncreases = new Map<string, number>();
  currentDayData.forEach((entry) => {
    const currentStars = safeParseInt(entry.Stars || "0");
    const previousStars = previousStarsByUser.get(entry.Name) || 0;
    const starIncrease = Math.max(0, currentStars - previousStars);
    userStarIncreases.set(entry.Name, starIncrease);
  });

  userStarIncreases.forEach((increase, username) => {
    if (increase > topEarner.starsEarned) {
      topEarner = { name: username, starsEarned: increase };
    }
  });

  return {
    newUsers,
    starsEarned,
    proofsGenerated,
    activeUsers: currentDayData.length,
    topEarner: topEarner.name,
    topEarnerStars: topEarner.starsEarned,
    totalStars,
    previousTotalStars,
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

    console.log(
      `Adjusted date range: ${format(startDate, "yyyy-MM-dd")} to ${format(
        endDate,
        "yyyy-MM-dd"
      )}`
    );

    // Get all CSV files sorted by date
    const allCSVFiles = getAllCSVFiles();

    // If no files found, return empty array for each day
    if (allCSVFiles.length === 0) {
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
          hasActualData: false,
        });
      }

      return NextResponse.json({
        success: true,
        data: emptyData,
      } as ActivityResponse);
    }

    // Process each day in the week
    const activityData: DailyActivity[] = [];

    // For each day in the week (Monday to Sunday)
    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(startDate, i);
      const currentDateStr = format(currentDate, "yyyy-MM-dd");

      // First try to find an exact match for this date
      const exactMatch = allCSVFiles.find(
        (file) => format(file.date, "yyyy-MM-dd") === currentDateStr
      );

      if (exactMatch) {
        console.log(
          `Found exact match for ${currentDateStr}: ${path.basename(
            exactMatch.path
          )}`
        );

        // Find the previous file (from before this date)
        const previousFile = allCSVFiles
          .filter((file) => file.date < currentDate)
          .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

        // Parse current day data
        const currentDayData = parseCSVFile(exactMatch.path);

        // Parse previous day data if available
        let previousDayData: LeaderboardEntry[] | null = null;
        if (previousFile) {
          previousDayData = parseCSVFile(previousFile.path);
          console.log(
            `Using previous file for comparison: ${path.basename(
              previousFile.path
            )}`
          );
        } else {
          console.log(`No previous file found for comparison`);
        }

        // Calculate metrics for this day
        const metrics = calculateDailyMetrics(currentDayData, previousDayData);

        // Add to activity data with hasActualData flag set to true
        activityData.push({
          day: format(currentDate, "EEE"),
          date: currentDateStr,
          ...metrics,
          hasActualData: true,
          totalStars: metrics.totalStars,
          previousTotalStars: metrics.previousTotalStars,
        });
      } else {
        // No data file exists for this date, use zeros
        console.log(`No file found for ${currentDateStr}, using zeros`);
        activityData.push({
          day: format(currentDate, "EEE"),
          date: currentDateStr,
          newUsers: 0,
          starsEarned: 0,
          proofsGenerated: 0,
          activeUsers: 0,
          topEarner: "N/A",
          topEarnerStars: 0,
          hasActualData: false,
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
