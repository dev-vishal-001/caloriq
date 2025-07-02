const prisma = require('../prisma/client');

exports.signIn = async (req, res) => {
  const { email } = req.body;
  const { password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email,password },
    });

    if (!user) {
      return res.json({ exists: false });
    }

    return res.json({
      exists: true,
      token: 'dummy-token-or-jwt',
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Error during sign-in:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
