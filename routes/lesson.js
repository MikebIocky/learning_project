const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
const LessonCompletion = require("../models/LessonCompletion");

// Middleware to check if the user is authenticated
const checkAuthenticated = (req, res, next) =>
  req.isAuthenticated() ? next() : res.redirect("/account/login");

// Utility Function to load data from JSON files
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

// Route to render the lesson page
router.get("/:lessonId", checkAuthenticated, (req, res) =>
  res.render("lesson.ejs", { lessonId: req.params.lessonId })
);

// Route to serve lesson data as JSON
router.get("/api/:lessonId", checkAuthenticated, async (req, res) => {
  const lessonData = await loadData("lesson", req.params.lessonId);
  lessonData
    ? res.json(lessonData)
    : res.status(404).send("Lesson not found");
});

// Route to handle lesson completion
router.post(
  "/api/complete-lesson", // Corrected API endpoint
  checkAuthenticated,
  async (req, res) => {
    try {
      // Create a new LessonCompletion record in the database
      await new LessonCompletion({
        userId: req.user._id,
        lessonId: req.body.lessonId, // Get lessonId from the request body
        completedAt: Date.now()
      }).save();
      res.status(200).json({ message: "Lesson completed" });
    } catch (error) {
      console.error("Error marking lesson as complete:", error);
      res.status(500).json({ error: "Failed to mark lesson as complete" });
    }
  }
);

module.exports = router;