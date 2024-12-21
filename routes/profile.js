const express = require("express");
const router = express.Router();
const QuizResponse = require("../models/QuizResponse");
const LessonCompletion = require("../models/LessonCompletion");
const WritingResponse = require("../models/WritingResponse");
const ListeningResponse = require("../models/ListeningResponse");

// Middleware
const checkAuthenticated = (req, res, next) =>
  req.isAuthenticated() ? next() : res.redirect("/account/login");

// Profile Routes
router.get("/", checkAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const completedReading = await QuizResponse.countDocuments({ userId, quizId: { $regex: /reading/ } }); 
    const completedListening = await ListeningResponse.countDocuments({ userId, quizId: { $regex: /listening/ } }) // Count listening responses
    const completedQuizzes = completedReading + completedListening;
    const completedLessons = await LessonCompletion.countDocuments({ userId });
    const completedWritings = await WritingResponse.countDocuments({ userId });

    res.render("profile.ejs", {
      name: req.user?.name || null,
      showHistory: false,
      user: req.user,
      completedReading,
      completedListening,
      completedQuizzes, // Pass completedQuizzes to the template
      completedLessons,
      completedWritings,
    });
  } catch (error) {
    console.error("Error fetching user activity:", error);
    res
      .status(500)
      .render("error", { message: "Failed to fetch user activity" });
  }
});

router.get("/history", checkAuthenticated, (req, res) => {
  res.render("profile.ejs", {
    name: req.user?.name || null,
    showHistory: true,
    user: req.user,
  });
});

module.exports = router;