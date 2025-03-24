const { nanoid } = require("nanoid");
const validUrl = require("valid-url");
const URL = require("../models/url");

async function generateNewShortUrl(req, res) {
  const { url, expirationDate } = req.body;
  if (!url) {
    return res.status(400).json({ message: "URL is required" });
  }

  // Validate URL using the URL constructor for stricter validation
  try {
    new URL(url);
  } catch (error) {
    return res.status(400).json({ message: "Invalid URL provided" });
  }

  // Check for a custom alias in the query string
  const alias = req.query.alias;

  try {
    if (alias) {
      // If alias is provided, ensure it is not already in use
      const existingAlias = await URL.findOne({ shortId: alias });
      if (existingAlias) {
        return res.status(409).json({ message: "Alias already in use" });
      }
      // Create the record with the custom alias
      const newUrl = new URL({
        shortId: alias,
        redirectUrl: url,
        clicked: 0,
        expirationDate: expirationDate ? new Date(expirationDate) : null
      });
      await newUrl.save();
      return res.status(200).json({ shortId: alias });
    } else {
      // Generate a unique short ID using nanoid
      const shortID = nanoid(8);
      const newUrl = new URL({
        shortId: shortID,
        redirectUrl: url,
        clicked: 0,
        expirationDate: expirationDate ? new Date(expirationDate) : null
      });
      await newUrl.save();
      return res.status(200).json({ shortId: shortID });
    }
  } catch (error) {
    console.error("Error creating short URL:", error);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  generateNewShortUrl,
};

