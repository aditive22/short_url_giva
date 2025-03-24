const express = require("express");
const mongoose = require("mongoose");
//const validUrl = require("valid-url"); // For URL validation
const { createClient } = require("redis"); // Redis client

const urlRoutes = require("./routes/url");
const URL = require("./models/url");
const app = express();
const port = 8001;

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect("mongodb+srv://vaditi858:aditiVerma92@cluster0.ozzk9.mongodb.net/short_urls?retryWrites=true&w=majority")
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Create and connect Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://:FBeUICycUaVlWxsFQIWqDHcLrvspHiXp@hopper.proxy.rlwy.net:39869'
});
redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.connect()
  .then(async () => {
    console.log("Connected to Redis");
    const pingResponse = await redisClient.ping();
    console.log("Redis ping response:", pingResponse); // Expect "PONG"
  })
  .catch((err) => console.error("Redis connection error:", err));

app.use("/shorten", urlRoutes);

// Redirection endpoint with Redis caching and edge case handling
app.get('/:shortId', async (req, res) => {
  const shortId = req.params.shortId;

  try {
    // Check if the data is cached in Redis
    const cachedData = await redisClient.get(shortId);
    if (cachedData) {
      console.log("Cache hit for", shortId);
      const { redirectUrl, clicked } = JSON.parse(cachedData);
      // Redirect immediately
      res.redirect(redirectUrl);
      // Increment the click count in MongoDB atomically
      await URL.findOneAndUpdate({ shortId }, { $inc: { clicked: 1 } });
      // Update cache with incremented click count
      const updatedClicked = clicked + 1;
      await redisClient.setEx(shortId, 3600, JSON.stringify({ redirectUrl, clicked: updatedClicked }));
      return;
    }
    
    // If not cached, query MongoDB for the URL entry
    const entry = await URL.findOne({ shortId });
    if (!entry) {
      return res.status(404).json({ message: "Short URL not found" });
    }
    
    // Check if the link is expired (if expirationDate is set and passed)
    if (entry.expirationDate && new Date() > entry.expirationDate) {
      return res.status(410).json({ message: "Link expired" });
    }
    
    // Validate the redirect URL using validUrl
    // if (!validUrl.isUri(entry.redirectUrl)) {
    //   return res.status(400).json({ message: "Invalid URL found for redirection" });
    // }
    
    // Increment the click count and save in MongoDB
    entry.clicked++;
    await entry.save();
    
    // Cache the data (redirectUrl and click count) in Redis with a TTL of 1 hour (3600 seconds)
    const dataToCache = JSON.stringify({ redirectUrl: entry.redirectUrl, clicked: entry.clicked });
    await redisClient.setEx(shortId, 3600, dataToCache);
    
    // Redirect to the original URL
    return res.redirect(entry.redirectUrl);
    
  } catch (error) {
    console.error("Error during redirection:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
