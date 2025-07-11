const prisma = require('../prisma/client');

exports.getHistoryByEmail = async (req, res) => {
  const { email } = req.query; 

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const historyRecords = await prisma.history.findMany({
      where: { email },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return res.status(200).json({ history: historyRecords });
  } catch (error) {
    console.error("❌ Error fetching history by email:", error);
    return res.status(500).json({ message: "Failed to fetch history records" });
  }
};
