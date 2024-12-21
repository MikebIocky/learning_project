// Fetch and display forum posts
async function fetchPosts() {
    const response = await fetch("/api/posts");
    const posts = await response.json();
    const postContainer = document.getElementById("posts");
    postContainer.innerHTML = ""; // Clear existing posts
  
    posts.forEach((post) => addPostToDOM(post));
  }


// Function to add a single post to the DOM
function addPostToDOM(post, addToTop = false) {
    // Check if the post already exists in the DOM (to prevent duplicates)
    if (document.getElementById(`post-${post._id}`)) {
      return; // Don't add it again
    }
  
    // Check if the logged-in user is the author of the post
    const isAuthor = loggedInUser === post.author;
    // Format the post's timestamp
    const timePosted = new Date(post.timestamp).toLocaleString();
  
    // Create the HTML for the post card
    const postCard = `
      <div class="post-card" id="post-${post._id}">
        <h3>${post.title}</h3>
        <p>${post.content}</p>
        <div class="post-meta">
          Posted by <strong>${post.author}</strong> on ${timePosted}
        </div>
        <div class="post-actions">
          <div class="vote-controls">
            <i class="fas fa-arrow-up" onclick="vote('${post._id}', 'upvote')"></i>
            <span>${post.votes}</span>
            <i class="fas fa-arrow-down" onclick="vote('${post._id}', 'downvote')"></i>
          </div>
          ${
            // Show delete button immediately after posting
            isAuthor
              ? `<button class="delete-post" onclick="deletePost('${post._id}')"><i class="fas fa-trash"></i> Delete</button>`
              : ""
          }
        </div>
        <div class="replies">
          <h4>Replies:</h4>
          <div id="replies-${post._id}">
            ${post.replies
              .map(
                (reply) => `
              <div class="reply" id="reply-${reply._id}">
                <p>${reply.content}</p>
                <div class="reply-meta">
                  <span>Posted by <strong>${
                    reply.author
                  }</strong> on ${new Date(
                  reply.timestamp
                ).toLocaleString()}</span>
                  ${
                    // Show delete button for replies immediately after posting
                    loggedInUser === reply.author
                      ? `<button class="delete-reply" onclick="deleteReply('${post._id}', '${reply._id}')"><i class="fas fa-trash"></i> Delete</button>`
                      : ""
                  }
                </div>
              </div>
            `
              )
              .join("")}
          </div>
          <form class="reply-form" onsubmit="addReply(event, '${post._id}')">
            <textarea placeholder="Write a reply..." required></textarea>
            <button type="submit">Reply</button>
          </form>
        </div>
      </div>
    `;
  
    // Add the post card to the DOM
    const postsContainer = document.getElementById("posts");
    if (addToTop) {
      postsContainer.insertAdjacentHTML("afterbegin", postCard); // Add to the top
    } else {
      postsContainer.insertAdjacentHTML("beforeend", postCard); // Add to the end
    }
  
    // Set initial vote button colors after adding the post to the DOM
    updateVoteControls(post._id, post.votes, post.upvotedBy, post.downvotedBy);
  }

// Function to handle upvoting/downvoting a post (CORRECTED)
async function vote(postId, action) {
    // Disable vote buttons immediately to prevent multiple clicks
    const upvoteButton = document.querySelector(`#post-${postId} .vote-controls .fa-arrow-up`);
    const downvoteButton = document.querySelector(`#post-${postId} .vote-controls .fa-arrow-down`);
    upvoteButton.disabled = true;
    downvoteButton.disabled = true;
  
    try {
      const response = await fetch(`/api/posts/${postId}/vote`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
  
      if (response.ok) {
        const updatedPost = await response.json();
  
        // Update vote controls AND refresh the post data
        updateVoteControls(
          postId,
          updatedPost.votes,
          updatedPost.upvotedBy,
          updatedPost.downvotedBy
        );
  
        // Fetch and update the specific post in the DOM
        fetchAndUpdatePost(postId);
  
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          // Alert for 403 Forbidden (already voted)
          alert(errorData.error);
        } else {
          // Generic error alert
          alert("Failed to vote.");
        }
      }
    } catch (error) {
      console.error("Error voting:", error);
      alert("An error occurred while voting.");
    } finally {
      // Re-enable the vote buttons after the response (success or error)
      upvoteButton.disabled = false;
      downvoteButton.disabled = false;
    }
  }

// Helper function to fetch and update a specific post in the DOM
async function fetchAndUpdatePost(postId) {
    try {
      const response = await fetch(`/api/posts/${postId}`);
      if (response.ok) {
        const updatedPost = await response.json();
        updatePostInDOM(updatedPost);
      } else {
        console.error("Failed to fetch updated post data.");
      }
    } catch (error) {
      console.error("Error fetching updated post data:", error);
    }
  }

// Helper function to update a post in the DOM
function updatePostInDOM(post) {
    const postElement = document.getElementById(`post-${post._id}`);
    if (postElement) {
      // Update vote count
      const voteSpan = postElement.querySelector(".vote-controls span");
      voteSpan.textContent = post.votes;
  
      // Update vote button colors
      updateVoteControls(post._id, post.votes, post.upvotedBy, post.downvotedBy);
    }
  }
// Helper function to update vote controls dynamically
function updateVoteControls(postId, votes, upvotedBy, downvotedBy) {
  const voteSpan = document.querySelector(
    `#post-${postId} .vote-controls span`
  );
  if (voteSpan) {
    voteSpan.textContent = votes;
  }

  const upvoteButton = document.querySelector(
    `#post-${postId} .vote-controls .fa-arrow-up`
  );
  const downvoteButton = document.querySelector(
    `#post-${postId} .vote-controls .fa-arrow-down`
  );

  // Reset colors first
  upvoteButton.style.color = "";
  downvoteButton.style.color = "";

  // Check if the current user has upvoted or downvoted
  const userId = loggedInUser; // Assuming you have the loggedInUser variable available
  if (upvotedBy.includes(userId)) {
    upvoteButton.style.color = "blue"; // Or your preferred color for upvoted
  } else if (downvotedBy.includes(userId)) {
    downvoteButton.style.color = "red"; // Or your preferred color for downvoted
  }
}

// Event listener for the new post form submission (CORRECTED)
document.getElementById("new-post-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    // Get the title and content from the form
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
  
    // Send a POST request to create a new post
    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
  
    if (response.ok) {
      const newPost = await response.json();
      // Add the new post to the TOP of the list (only once)
      addPostToDOM(newPost, true); // true indicates adding to the top
      closeModal(); // Close the modal
      document.getElementById("new-post-form").reset(); // Reset the form
    }
  });

// Function to delete a post
async function deletePost(postId) {
  try {
    const response = await fetch(`/api/posts/${postId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      // Remove the post from the DOM
      document.getElementById(`post-${postId}`).remove();
      alert("Post deleted successfully.");
    } else {
      const error = await response.json();
      alert(`Error deleting post: ${error.error}`);
    }
  } catch (err) {
    console.error("Error deleting post:", err);
    alert("An unexpected error occurred while deleting the post.");
  }
}

// Function to add a reply to a post
async function addReply(event, postId) {
  event.preventDefault();

  // Get the reply content from the textarea
  const replyContent = event.target.querySelector("textarea").value;

  try {
    const response = await fetch(`/api/posts/${postId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyContent }),
    });

    if (response.ok) {
      const newReply = await response.json();
      // Add the new reply to the DOM
      const replyContainer = document.getElementById(`replies-${postId}`);
      const replyHTML = `
          <div class="reply" id="reply-${newReply._id}">
            <p>${newReply.content}</p>
            <div class="reply-meta">
              <span>Posted by <strong>${newReply.author}</strong> on ${new Date(
        newReply.timestamp
      ).toLocaleString()}</span>
              ${
                // Show delete button only if the user is the author of the reply
                loggedInUser === newReply.author
                  ? `<button class="delete-reply" onclick="deleteReply('${postId}', '${newReply._id}')"><i class="fas fa-trash"></i> Delete</button>`
                  : ""
              }
            </div>
          </div>
        `;
      replyContainer.insertAdjacentHTML("beforeend", replyHTML);
      event.target.reset(); // Clear the reply textarea
    } else {
      alert("Failed to add reply.");
    }
  } catch (error) {
    console.error("Error adding reply:", error);
    alert("An error occurred while adding the reply.");
  }
}

// Function to delete a reply
async function deleteReply(postId, replyId) {
  try {
    const response = await fetch(`/api/posts/${postId}/replies/${replyId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      // Remove the reply from the DOM
      document.getElementById(`reply-${replyId}`).remove();
      alert("Reply deleted successfully.");
    } else {
      const error = await response.json();
      alert(`Error deleting reply: ${error.error}`);
    }
  } catch (err) {
    console.error("Error deleting reply:", err);
    alert("An unexpected error occurred while deleting the reply.");
  }
}

// Event listener for the create post button (opens the modal)
document.getElementById("create-post-button").addEventListener("click", () => {
  document.getElementById("new-post-modal").style.display = "block";
});

// Function to close the new post modal
function closeModal() {
  document.getElementById("new-post-modal").style.display = "none";
}

// Fetch posts when the page loads
fetchPosts();
