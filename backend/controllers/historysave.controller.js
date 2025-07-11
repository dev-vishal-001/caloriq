const prisma = require('../prisma/client');

exports.createHistory = async (req, res) => {
    const {
      id,
      dish_name,
      calories_per_serving,
      servings,
      total_calories,
      time,
      timestamp,
      email
    } = req.body;
    try {
      const newHistory = await prisma.history.create({
        data: {
          id,
          dish_name,
          calories_per_serving,
          servings,
          total_calories,
          time,
          timestamp: new Date(timestamp),
          email,
        },
      });
      
      return res.status(201).json({ message: 'History created successfully', history: newHistory });
    } catch (error) {
      console.error("❌ Error creating history:", error);
      return res.status(500).json({ message: "Failed to create history record" });
    }
  };
  