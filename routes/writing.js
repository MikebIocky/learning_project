// routes/writing.js
const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const path = require("path");
const WritingResponse = require("../models/WritingResponse");

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

// Writing Task Routes
router.get("/:taskId", checkAuthenticated, (req, res) =>
  res.render("writing.ejs", { taskId: req.params.taskId })
);

router.get("/api/:taskId", checkAuthenticated, async (req, res) => {
  const taskData = await loadData("writing", req.params.taskId);
  taskData ? res.json(taskData) : res.status(404).send("Task not found");
});

router.post("/submit-writing", checkAuthenticated, async (req, res) => {
  try {
    const { task, response, wordCount } = req.body;
    await new WritingResponse({
      userId: req.user._id,
      task,
      response,
      wordCount,
    }).save();
    res
      .status(200)
      .json({ message: "Writing response submitted successfully." });
  } catch (error) {
    console.error("Error saving writing response:", error);
    res.status(500).json({ error: "Failed to save writing response." });
  }
});

module.exports = router;