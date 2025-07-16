import axios from "axios";

import dotenv from "dotenv";
dotenv.config();

class DsService {
  private readonly apiKey: string;
  private readonly baseUrl: string =
    "https://152.53.243.39.sslip.io/api/discord";

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    if (!apiKey) {
      throw new Error("NEXT_API_KEY not set");
    }
    this.apiKey = apiKey;
  }

  async getRolesInfo(): Promise<any> {
    const url = `${this.baseUrl}`;
    const response = await axios.get(url, {
      headers: {
        "x-api-key": this.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    return response.data;
  }

  async checkStatsImport(idOrUsername: string, retries = 3): Promise<any> {
    const url = `${this.baseUrl}/${encodeURIComponent(idOrUsername)}`;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.get(url, {
          headers: {
            "x-api-key": this.apiKey,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 5000, // 5-second timeout
        });

        console.log(response)

        return response.data;
      } catch (error: any) {
        console.error("Error fetching stats import:", {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          attempt,
        });

        if (attempt === retries) {
          throw new Error(
            `Failed to fetch stats after ${retries} attempts: ${error.message}`
          );
        }

        console.warn(`Retry ${attempt}/${retries} failed, retrying...`);
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
}

export const dsService = new DsService();
