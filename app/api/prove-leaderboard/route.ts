import { type NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getTodayJsonFilePath() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  // Format: prove_leaderboard@MM_DD_YYYY.json
  const filename = `prove_leaderboard@${mm}_${dd}_${yyyy}.json`;
  return path.join(
    process.cwd(),
    'public',
    'prove_leaderboard',
    filename
  );
}

function getLatestJsonFilePath() {
  const dir = path.join(process.cwd(), 'public', 'prove_leaderboard');
  const files = fs.readdirSync(dir)
    .filter(f => /^prove_leaderboard@\d{2}_\d{2}_\d{4}\.json$/.test(f))
    .sort((a, b) => {
      // Extract date parts and compare
      const getDate = (fname: string) => {
        const [mm, dd, yyyy] = fname.match(/\d{2}_\d{2}_\d{4}/)![0].split('_');
        return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      };
      return getDate(b).getTime() - getDate(a).getTime();
    });
  if (files.length === 0) {
    throw new Error('No leaderboard JSON files found.');
  }
  return path.join(dir, files[0]);
}

function loadJsonData() {
  let jsonFilePath = getTodayJsonFilePath();
  if (!fs.existsSync(jsonFilePath)) {
    // Fallback to latest available file
    jsonFilePath = getLatestJsonFilePath();
  }
  const raw = fs.readFileSync(jsonFilePath, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Prove Leaderboard API
 * 
 * Endpoints (use `action` query param):
 * 
 * - ?action=getByUsername&username=<username>
 *     Returns the leaderboard entry for the given username (case-insensitive, with or without @).
 *     Example: /api/prove-leaderboard?action=getByUsername&username=alice
 *     Response: { data: { ...userEntry } }
 * 
 * - ?action=getByPage&page=<page>&entriesPerPage=<n>
 *     Returns a paginated list of leaderboard entries.
 *     Example: /api/prove-leaderboard?action=getByPage&page=2&entriesPerPage=10
 *     Response: { data: [...], total: <number> }
 * 
 * - ?action=totalStats
 *     Returns total stats for the leaderboard, such as total users, total proofs, and aggregate points.
 *     Example: /api/prove-leaderboard?action=totalStats
 *     Response: { totalUsers: <number>, totalProofs: <number>, totalPoints: <number> }
 * 
 * - ?action=topN&n=<number>
 *     Returns the top N users by points.
 *     Example: /api/prove-leaderboard?action=topN&n=5
 *     Response: { data: [ ...topNEntries ] }
 * 
 * - ?action=statsByUsername&username=<username>
 *     Returns stats for a specific user (e.g., rank, points, proofs).
 *     Example: /api/prove-leaderboard?action=statsByUsername&username=alice
 *     Response: { username: ..., rank: <number>, points: <number>, proofs: <number> }
 * 
 * - (no action)
 *     Returns the full leaderboard data (not recommended for large files).
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const username = searchParams.get('username');
  const page = Number(searchParams.get('page') || 1);
  const entriesPerPage = Number(searchParams.get('entriesPerPage') || 20);
  const n = Number(searchParams.get('n') || 10);

  try {
    const data = loadJsonData();

    // Helper: sort by points descending
    const sortedData = Array.isArray(data)
      ? [...data].sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
      : [];

    if (!action) {
      // If no action param, return all data
      return NextResponse.json(data, { status: 200 });
    }

    if (action === 'getByUsername' && username) {
      const normalized = username.startsWith('@')
        ? username.toLowerCase()
        : `@${username.toLowerCase()}`;
      const result = data.find(
        (entry: any) => entry.username.toLowerCase() === normalized
      );
      if (!result) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ data: result }, { status: 200 });
    }

    if (action === 'getByPage') {
      const startIndex = (page - 1) * entriesPerPage;
      const pagedData = sortedData.slice(startIndex, startIndex + entriesPerPage);
      return NextResponse.json(
        { data: pagedData, total: sortedData.length },
        { status: 200 }
      );
    }

    if (action === 'totalStats') {
      // Aggregate stats
      const totalUsers = Array.isArray(data) ? data.length : 0;
      let totalProofs = 0;
      let totalPoints = 0;
      if (Array.isArray(data)) {
        for (const entry of data) {
          totalProofs += Number(entry.proofs ?? 0);
          totalPoints += Number(entry.points ?? 0);
        }
      }
      return NextResponse.json(
        { totalUsers, totalProofs, totalPoints },
        { status: 200 }
      );
    }

    if (action === 'topN') {
      const topN = sortedData.slice(0, n);
      return NextResponse.json({ data: topN }, { status: 200 });
    }

    if (action === 'statsByUsername' && username) {
      const normalized = username.startsWith('@')
        ? username.toLowerCase()
        : `@${username.toLowerCase()}`;
      const userIndex = sortedData.findIndex(
        (entry: any) => entry.username.toLowerCase() === normalized
      );
      if (userIndex === -1) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      const user = sortedData[userIndex];
      return NextResponse.json(
        {
          username: user.username,
          rank: userIndex + 1,
          points: user.points ?? 0,
          proofs: user.proofs ?? 0,
        },
        { status: 200 }
      );
    }

    // Default: return all data (not recommended for large files)
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Error reading leaderboard data' },
      { status: 500 }
    );
  }
}
