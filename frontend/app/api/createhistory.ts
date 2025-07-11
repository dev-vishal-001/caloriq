export interface CreateHistoryRequest {
    id: string;
    dish_name: string;
    calories_per_serving: number;
    servings: number;
    total_calories: number;
    time: string;
    timestamp: string; 
    email: string;
  }
  
  export interface CreateHistoryResponse {
    message: string;
    history: {
      id: string;
      dish_name: string;
      calories_per_serving: number;
      servings: number;
      total_calories: number;
      time: string;
      timestamp: string;
      email: string;
    };
  }
  
export async function createHistoryRequest(
  body: CreateHistoryRequest
): Promise<CreateHistoryResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const res = await fetch(`${baseUrl}/api/auth/createHistory`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("❌ Backend error response:", err);
    throw new Error(err.message || "Failed to create history record");
  }

  const data: CreateHistoryResponse = await res.json();
  console.log("✅ History created:", data);
  return data;
}
