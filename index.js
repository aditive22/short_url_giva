const express = require("express");
const mongoose = require("mongoose");
const validUrl = require("valid-url"); // Added for URL validation

const urlRoutes = require("./routes/url");
const URL = require("./models/url");
const app = express();
const port = 8001;

// Middleware to parse JSON bodies
app.use(express.json());

mongoose.connect("mongodb+srv://vaditi858:aditiVerma92@cluster0.ozzk9.mongodb.net/short_urls?retryWrites=true&w=majority")
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/shorten", urlRoutes);

// Redirection endpoint with edge case handling
app.get('/:shortId', async (req, res) => {
  const shortId = req.params.shortId;
  
  // Find the URL entry by shortId
  const entry = await URL.findOne({ shortId });
  if (!entry) {
    return res.status(404).json({ message: "Short URL not found" });
  }
  
  // Check for expired link (if expirationDate is set and passed)
  if (entry.expirationDate && new Date() > entry.expirationDate) {
    return res.status(410).json({ message: "Link expired" });
  }
  
  // Validate the redirect URL
  if (!validUrl.isUri(entry.redirectUrl)) {
    return res.status(400).json({ message: "Invalid URL found for redirection" });
  }
  
  // Update the click count and save
  entry.clicked++;
  await entry.save();
  
  // Redirect to the original URL
  res.redirect(entry.redirectUrl);
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
