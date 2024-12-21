// routes/api.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const QuizResponse = require("../models/QuizResponse");
const LessonCompletion = require("../models/LessonCompletion");
const WritingResponse = require("../models/WritingResponse");
const ListeningResponse = require("../models/ListeningResponse"); // Import ListeningResponse
const Post = require("../models/Post");

// Middleware
const checkAuthenticated = (req, res, next) =>
  req.isAuthenticated() ? next() : res.redirect("/account/login");

// API Routes
router.get("/check-email", async (req, res) => {
  try {
    res.json({ exists: !!(await User.findOne({ email: req.query.email })) });
  } catch (err) {
    console.error("Error checking email:", err);
    res.status(500).json({ error: "Error checking email" });
  }
});

router.get("/user-activity", checkAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const completedQuizzes = await QuizResponse.countDocuments({ userId });
    const completedLessons = await LessonCompletion.countDocuments({ userId });
    const completedWritings = await WritingResponse.countDocuments({ userId });
    res.json({ completedQuizzes, completedLessons, completedWritings });
  } catch (err) {
    console.error("Error fetching user activity:", err);
    res.status(500).json({ error: "Failed to fetch user activity" });
  }
});

router.get("/user-history", checkAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const quizzes = await QuizResponse.find({ userId });
    const lessons = await LessonCompletion.find({ userId });
    const writings = await WritingResponse.find({ userId });
    const listenings = await ListeningResponse.find({ userId }); // Fetch listening responses
    res.json({ quizzes, lessons, writings, listenings }); // Include listenings in the response
  } catch (err) {
    console.error("Error fetching user history:", err);
    res.status(500).json({ error: "Failed to fetch user history" });
  }
});

router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ timestamp: -1 });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Error fetching posts" });
  }
});

router.post("/posts", checkAuthenticated, async (req, res) => {
  try {
    const { title, content } = req.body;
    const newPost = new Post({
      title,
      content,
      author: req.user.name,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error adding post:", error);
    res.status(500).json({ error: "Error adding post" });
  }
});

router.delete("/posts/:id", checkAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.author !== req.user.name) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this post" });
    }

    await Post.deleteOne({ _id: id });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the post." });
  }
});


// Route to handle upvoting/downvoting a post
router.put("/posts/:id/vote", checkAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const userId = req.user._id; // Get the user's ID

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if the user has already voted
    const hasUpvoted = post.upvotedBy.includes(userId);
    const hasDownvoted = post.downvotedBy.includes(userId);

    if (action === "upvote") {
      if (hasUpvoted) {
        return res.status(403).json({ error: "You have already upvoted this post." });
      } else {
        // Add upvote
        post.upvotedBy.push(userId);
        post.votes += 1;
        // Remove downvote if it exists
        if (hasDownvoted) {
          post.downvotedBy.pull(userId);
        }
      }
    } else if (action === "downvote") {
      if (hasDownvoted) {
        return res
          .status(403)
          .json({ error: "You have already downvoted this post." });
      } else {
        // Add downvote
        post.downvotedBy.push(userId);
        post.votes -= 1;
        // Remove upvote if it exists
        if (hasUpvoted) {
          post.upvotedBy.pull(userId);
        }
      }
    }

    // Limit the minimum vote count to 0
    if (post.votes < 0) {
      post.votes = 0;
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error("Error updating vote:", error);
    res.status(500).json({ error: "Error updating vote" });
  }
});

router.post("/posts/:id/replies", checkAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const reply = {
      content,
      author: req.user.name,
      timestamp: new Date(),
    };
    post.replies.push(reply);
    await post.save();

    res.status(201).json(reply);
  } catch (error) {
    console.error("Error adding reply:", error);
    res.status(500).json({ error: "Error adding reply." });
  }
});

router.delete(
  "/posts/:postId/replies/:replyId",
  checkAuthenticated,
  async (req, res) => {
    try {
      const { postId, replyId } = req.params;

      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      const reply = post.replies.id(replyId);
      if (!reply) {
        return res.status(404).json({ error: "Please refresh the page in remove it" });
      }

      if (reply.author !== req.user.name) {
        return res
          .status(403)
          .json({ error: "You are not authorized to delete this reply" });
      }

      await Post.updateOne(
        { _id: postId },
        { $pull: { replies: { _id: replyId } } }
      );

      res.status(200).json({ message: "Reply deleted successfully" });
    } catch (error) {
      console.error("Error deleting reply:", error);
      res
        .status(500)
        .json({ error: "An error occurred while deleting the reply." });
    }
  }
);

module.exports = router;