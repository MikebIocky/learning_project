// routes/reading.js
const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
const QuizResponse = require("../models/QuizResponse");

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
  
  // Reading Test Routes
  router.get("/:quizId", checkAuthenticated, (req, res) => {
    res.render("reading.ejs", { quizId: req.params.quizId });
  });
  
  router.get("/api/:quizId", checkAuthenticated, async (req, res) => {
    const id = req.params.quizId.replace('reading-quiz/', ''); // Handle potential prefix
    console.log({
      requestedId: id,
      currentDir: __dirname,
      attempting: `Loading reading quiz with ID: ${id}`
    });
    
    const quizData = await loadData("reading", id);
    if (quizData) {
      console.log("Quiz data found");
      res.json(quizData);
    } else {
      console.error("Quiz not found for ID:", id);
      res.status(404).send("Quiz not found");
    }
  });
// Quiz Submission
router.post("/submit-quiz", checkAuthenticated, async (req, res) => {
    try {
        console.log("Received quiz submission:", req.body);
        await new QuizResponse(req.body).save();
        res.status(200).json({ message: "Quiz response submitted successfully." });
    } catch (error) {
        console.error("Error saving quiz response:", error);
        res.status(500).json({ error: "Failed to save quiz response." });
    }
});

module.exports = router;