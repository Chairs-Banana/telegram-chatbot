require("dotenv").config();

const { bot } = require("../src/bot");

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true, message: "Telegram Bot Webhook" });
  }

  try {
    // Process the update
    await bot.handleUpdate(req.body, res);
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(200).json({ ok: true }); // Always return 200 to Telegram
  }
};
