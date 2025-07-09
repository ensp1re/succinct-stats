import type { LeaderboardEntry } from "@/lib/types";
import axios from "axios";

export const getAllEntries = async (): Promise<LeaderboardEntry[]> => {
  const res = await axios.get("/api/leaderboard");
  return res.data;
};

export const getEntryByUsername = async (username: string) => {
  const res = await axios.get(`/api/leaderboard`, {
    params: {
      action: "getByUsername",
      username: username,
    },
  });
  return res.data;
};

export const getEntriesByPage = async (
  page: number,
  entriesPerPage: number
) => {
  const res = await axios.get(`/api/leaderboard`, {
    params: {
      action: "getByPage",
      page: page,
      entriesPerPage: entriesPerPage,
    },
  });
  return res.data; // returns { data: [...], total: number }
};

export const getStarRanges = async () => {
  const res = await axios.get("/api/leaderboard", {
    params: {
      action: "getStarRanges",
    },
  });
  console.log(res);
  return res.data;
};

export const getTopPerformers = async (limit = 5) => {
  const res = await axios.get(`/api/leaderboard`, {
    params: {
      action: "getTopPerformers",
      limit: limit,
    },
  });
  return res.data;
};

export const getNetworkStats = async () => {
  try {
    const res = await axios.get("/api/leaderboard", {
      params: {
        action: "getNetworkStats",
      },
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      console.error("Endpoint /api/network-stats not found");
    } else {
      console.error("An error occurred while fetching network stats", error);
    }
    throw error;
  }
};

export const topInvitersLeaderboardByPage = async (
  page: number,
  entriesPerPage: number
) => {
  const res = await axios.get("/api/leaderboard", {
    params: {
      action: "topInvitersLeaderboardByPage",
      page,
      entriesPerPage,
    },
  });
  return res.data;
};

export const fetchActivityData = async (startDate: string, endDate: string) => {
  try {
    const res = await axios.get("/api/activity", {
      params: {
        startDate,
        endDate,
      },
    });

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching activity data:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};

export const getTopUsersByProofsByPage = async (
  page: number,
  entriesPerPage: number
) => {
  try {
    const res = await axios.get("/api/leaderboard", {
      params: {
        action: "getTopUsersByProofsByPage",
        page,
        entriesPerPage,
      },
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching top users by proofs:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};

export const getTotalEntries = async () => {
  try {
    const res = await axios.get("/api/leaderboard", {
      params: {
        action: "getTotalEntries",
      },
    });
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error fetching total entries:", error.message);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};
