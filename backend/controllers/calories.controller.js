const axios = require("axios");
require("dotenv").config();

exports.getCalories = async (req, res) => {
  const { dish_name, servings = 1 } = req.body ?? {};
  if (!dish_name || servings <= 0) {
    return res.status(400).json({ message: "dish_name and valid servings required" });
  }

  try {
    const searchResponse = await axios.get(
      "https://api.nal.usda.gov/fdc/v1/foods/search",
      {
        params: {
          api_key: process.env.USDA_API_KEY,
          query: dish_name,
          pageSize: 1,
        },
      }
    );

    const foodHit = searchResponse.data.foods?.[0];
    if (!foodHit) {
      return res.status(404).json({ message: "Dish not found in USDA database" });
    }

    const foodDetailResponse = await axios.get(
      `https://api.nal.usda.gov/fdc/v1/food/${foodHit.fdcId}`,
      {
        params: { api_key: process.env.USDA_API_KEY },
      }
    );
    const food = foodDetailResponse.data;

    let caloriesPerServing = food.labelNutrients?.calories?.value ?? null;

    if (caloriesPerServing == null) {
      const kcalNutrient = food.foodNutrients?.find(n => n.nutrientNumber === "208");
      const kcalPer100g = kcalNutrient?.amount ?? 0;
      const gramsPerServing = food.servingSize || 100;
      caloriesPerServing = (kcalPer100g / 100) * gramsPerServing;
    }

    const totalCalories = caloriesPerServing * servings;

    return res.json({
      dish_name,
      servings,
      calories_per_serving: Math.round(caloriesPerServing),
      total_calories: Math.round(totalCalories),
      source: "USDA FoodData Central",
    });
  } catch (error) {
    console.error("❌ Error fetching calories:", error?.response?.data || error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
