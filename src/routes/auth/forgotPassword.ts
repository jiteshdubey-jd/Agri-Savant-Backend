import express from "express";
import jwt from "jsonwebtoken";
import User from "../../models/User";
import sendEmail from "../../utils/sendEmail";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Generate JWT token for password reset
    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // ✅ Create the password reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // ✅ Send the email with HTML content for password reset
    const htmlContent = `
      <html>
        <body>
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border-radius: 8px;">
            <div style="text-align: center; padding: 20px;">
              <h2 style="color: #333;">Password Reset Request</h2>
              <p style="font-size: 16px; color: #555;">Hello, ${
                user.name || "User"
              },</p>
              <p style="font-size: 16px; color: #555;">We received a request to reset your password. Please click the button below to reset your password:</p>
              <div style="text-align: center; margin-top: 20px;">
                <a href="${resetLink}" style="background-color: #007bff; color: #fff; padding: 12px 24px; text-decoration: none; font-size: 16px; border-radius: 5px;">Reset Password</a>
              </div>
              <p style="font-size: 14px; color: #777; margin-top: 20px;">If you didn't request a password reset, please ignore this email.</p>
              <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px; font-size: 14px; color: #777;">
                <p>If you have any questions, feel free to contact our support team.</p>
                <p>Best Regards, <br/> The [Your Company] Team</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail(user.email, "Password Reset Request", htmlContent);

    return res.json({ message: "Password reset link sent successfully" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
