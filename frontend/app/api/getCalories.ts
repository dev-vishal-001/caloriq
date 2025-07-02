export interface CalorieRequest {
    dish_name: string;
    servings: number;
  }
  
  export interface CalorieResponse {
    dish_name: string;
    servings: number;
    calories_per_serving: number;
    total_calories: number;
    source: string;
  }
  
  export async function getCaloriesRequest(body: CalorieRequest): Promise<CalorieResponse> {
    const res = await fetch("https://caloriq-back-end.onrender.com/api/auth/getCalories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  
    if (!res.ok) {
      const err = await res.json();
      console.error("❌ Calorie lookup failed:", err);
      throw new Error(err.message || "Unable to fetch calories");
    }
  
    const data = await res.json();
    console.log("✅ Calories response:", data);
    return data;
  }
  
