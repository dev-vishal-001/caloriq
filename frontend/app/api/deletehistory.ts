export interface DeleteHistoryRequest {
    id: string;
  }
  
  export interface DeleteHistoryResponse {
    message: string;
    deletedId: string;
  }
  
  export async function deleteHistoryRequest(body: DeleteHistoryRequest): Promise<DeleteHistoryResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const res = await fetch(`${baseUrl}/api/auth/deleteHistory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  
    if (!res.ok) {
      const err = await res.json();
      console.error("❌ Delete history failed:", err);
      throw new Error(err.message || "Unable to delete history");
    }
  
    const data = await res.json();
    console.log("✅ History delete response:", data);
    return data;
  }
  