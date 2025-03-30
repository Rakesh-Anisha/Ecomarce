const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

// Existing routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    user,
  });
});

// New admin registration route
router.post("/register-admin", async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    const User = require("../../models/User"); // Ensure User model is imported
    const bcrypt = require("bcryptjs"); // Ensure bcrypt is available

    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with the same email! Please try again",
      });
    }

    const hashPassword = await bcrypt.hash(password, 12);
    const newAdmin = new User({
      userName,
      email,
      password: hashPassword,
      role: "admin", // Explicitly set role to admin
    });

    await newAdmin.save();
    res.status(200).json({
      success: true,
      message: "Admin registration successful",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
});

module.exports = router;