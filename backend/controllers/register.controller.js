const prisma = require('../prisma/client');

exports.register = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    mobile,
    password,
  } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.json({ exists: true });
    }
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        email,
        mobile,
        password: password,
        confirmPassword: password,
      },
    });

    return res.status(201).json({
      exists: false,
      user: newUser,
    });
  } catch (error) {
    console.error("❌ Error registering user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
