// routes/listening.js
const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
const ListeningResponse = require("../models/ListeningResponse");

// Middleware
const checkAuthenticated = (req, res, next) =>
  req.isAuthenticated() ? next() : res.redirect("/account/login");

// Utility Functions
  const loadData = async (type, id) => {
    try {
      const filePath = path.resolve(__dirname, "../data", type, `${id}.json`);
      console.log(`Loading data from: ${filePath}`); // Log the file path
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading ${type} data from ${filePath}:`, error.message);
      return null;
    }
  };

// Listening Test Routes
router.get("/:testId", checkAuthenticated, (req, res) =>
  res.render("listening.ejs", { testId: req.params.testId })
);

router.get("/api/:testId", checkAuthenticated, async (req, res) => {
  const testData = await loadData("listening", req.params.testId);
  testData ? res.json(testData) : res.status(404).send("Test not found");
});

router.post("/submit-quiz", checkAuthenticated, async (req, res) => {
    try {
        console.log("Received quiz submission:", req.body);
        await new ListeningResponse(req.body).save();
        res.status(200).json({ message: "Quiz response submitted successfully." });
    } catch (error) {
        console.error("Error saving quiz response:", error);
        res.status(500).json({ error: "Failed to save quiz response." });
    }
});

module.exports = router;