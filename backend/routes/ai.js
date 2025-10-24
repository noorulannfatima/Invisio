const express = require("express");
const router = express.Router();
const fetch = require("node-fetch"); // Required for Node <18

router.post("/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    // Call Monkedev free AI API
    const response = await fetch(`https://api.monkedev.com/fun/chat?msg=${encodeURIComponent(message)}`);
    const data = await response.json();

    // The API returns something like: { response: "AI reply text" }
    const reply = data.response || "Sorry, I couldn’t generate a response.";

    res.json({ reply });
  } catch (err) {
    console.error("AI API error:", err);
    res.status(500).json({ error: "Failed to connect to AI API" });
  }
});

module.exports = router;
