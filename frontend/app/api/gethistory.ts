export interface HistoryRecord {
    id: string;
    dish_name: string;
    calories_per_serving: number;
    servings: number;
    total_calories: number;
    time: string;
    timestamp: string; // ISO format
    email: string;
  }
  
  export interface GetHistoryRequest {
    email: string;
  }
  
  export interface GetHistoryResponse {
    history: HistoryRecord[];
  }
  
  export async function getHistoryRequest(body: GetHistoryRequest): Promise<GetHistoryResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const res = await fetch(`${baseUrl}/api/auth/getHistory?email=${encodeURIComponent(body.email)}`, {
      method: "GET",
    });
  
    if (!res.ok) {
      const err = await res.json();
      console.error("❌ History lookup failed:", err);
      throw new Error(err.message || "Unable to fetch history");
    }
  
    const data = await res.json();
    console.log("✅ History response:", data);
    return data;
  }
  
  