document.addEventListener("DOMContentLoaded", () => {
  const startLessonBtn = document.getElementById("start-lesson-btn");
  const lessonContent = document.getElementById("lesson-content");
  let lessonData = null;
  let lessonSections = [];
  let currentSectionIndex = 0;
  let completeLessonBtn = null;

  // Function to fetch lesson data from the server
  async function fetchLessonData() {
    try {
      // Use template literals for cleaner string interpolation
      const response = await fetch(`/lesson/api/${lessonId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      lessonData = await response.json();
      console.log(lessonData);
      loadLesson(lessonData);
    } catch (error) {
      console.error("Failed to fetch lesson data:", error);
    }
  }

  // Function to load and display the lesson content
  function loadLesson(data) {
    // Set lesson title and description
    document.querySelector(".lesson-card h2").textContent = data.title;
    document.querySelector(".lesson-card p").textContent = data.description;

    data.sections.forEach((section, sectionIndex) => {
      // Create a container for each section
      const sectionElement = document.createElement("div");
      sectionElement.classList.add("lesson-section");
      sectionElement.id = section.id;
      sectionElement.style.display = "none"; // Initially hidden

      // Build the HTML content for the section
      let contentHTML = `
        <h3 class="lesson-heading">${section.heading}</h3>
        <p class="lesson-text">${section.text}</p>
      `;

      // Add examples if available
      if (section.examples) {
        contentHTML += `
          <div class="example-box">
            <p>Examples:</p>
            <ul>
              ${section.examples
            .map((example) => `<li>${example}</li>`)
            .join("")}
            </ul>
          </div>
        `;
      }

      // Add synonym/antonym pairs if available
      if (section.synonymAntonymPairs) {
        contentHTML += `
          <div class="example-box">
            ${section.synonymAntonymPairs
            .map(
              (pair) => `
              <div class="synonym-antonym-pair">
                <div class="word">${pair.word}</div>
                <div class="synonyms">Synonyms: ${pair.synonyms
                  .map((s) => `<span class="example-word">${s}</span>`)
                  .join(", ")}</div>
                <div class="antonyms">Antonyms: ${pair.antonyms
                  .map((s) => `<span class="example-word">${s}</span>`)
                  .join(", ")}</div>
              </div>
            `
            )
            .join("")}
          </div>
        `;
      }

      // Add quiz container if the section has a quiz
      if (section.quiz) {
        contentHTML += `<div id="quiz-container-${sectionIndex}"></div>`; // Unique ID for each quiz container
      }

      sectionElement.innerHTML = contentHTML;
      lessonContent.appendChild(sectionElement);
      lessonSections.push(sectionElement);

      // Handle quiz if present
      if (section.quiz) {
        const quizContainer = sectionElement.querySelector(
          `#quiz-container-${sectionIndex}`
        ); // Target the specific quiz container
        const quizQuestions = section.quizQuestions;

        function displayQuizQuestions() {
          quizQuestions.forEach((questionData, questionIndex) => {
            const questionElement = document.createElement("div");
            questionElement.classList.add("quiz-question");
            questionElement.innerHTML = `
              <p>${questionIndex + 1}. ${questionData.question}</p>
              ${questionData.options
                .map(
                  (option) => `
                <label>
                  <input type="radio" name="question${sectionIndex}-${questionIndex}" value="${option}"> ${option}
                </label><br>
              `
                )
                .join("")}
            `;
            quizContainer.appendChild(questionElement);
          });
        }

        displayQuizQuestions();

        // Add a "Submit Quiz" button
        const submitQuizBtn = document.createElement("button");
        submitQuizBtn.id = `submit-quiz-btn-${sectionIndex}`; // Unique ID for each submit button
        submitQuizBtn.textContent = "Submit Quiz";
        sectionElement.appendChild(submitQuizBtn);

        // Add an event listener to the "Submit Quiz" button
        submitQuizBtn.addEventListener("click", () => {
          let score = 0;
          quizQuestions.forEach((questionData, questionIndex) => {
            const selectedAnswer = document.querySelector(
              `input[name="question${sectionIndex}-${questionIndex}"]:checked`
            )?.value;
            if (selectedAnswer === questionData.answer) {
              score++;
            }
          });
          alert(
            `You got ${score} out of ${quizQuestions.length} questions right!`
          );
        });
      }

      // Add "Next" button to all sections except the last one
      if (sectionIndex < data.sections.length - 1) {
        const nextBtn = document.createElement("button");
        nextBtn.classList.add("next-btn");
        nextBtn.textContent = "Next";
        nextBtn.addEventListener("click", () => {
          showSection(sectionIndex + 1);
        });
        sectionElement.appendChild(nextBtn);
      }
    });

    // Create the "Complete Lesson" button (initially hidden)
    completeLessonBtn = document.createElement("button");
    completeLessonBtn.id = "complete-lesson-btn";
    completeLessonBtn.dataset.lessonId = lessonId; // Store lessonId as data attribute
    completeLessonBtn.textContent = "Complete Lesson";
    completeLessonBtn.style.display = "none";

    // Event listener for "Complete Lesson" button
    completeLessonBtn.addEventListener("click", async () => {
      // Send a request to the server to mark the lesson as complete
      try {
        const response = await fetch("/lesson/api/complete-lesson", {
          // Correct API endpoint
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ lessonId: lessonId }), // Send lessonId in the request body
        });

        if (response.ok) {
          console.log("Lesson completion data sent successfully");
          // Optionally, display a success message or update UI
        } else {
          console.error(
            "Failed to send lesson completion data:",
            await response.text()
          );
        }
      } catch (error) {
        console.error("Error while sending lesson completion data:", error);
      }

      // Redirect to the lesson library after a short delay
      setTimeout(() => {
        window.location.href = "/library?type=lesson";
      }, 1000);
    });

    // Append the "Complete Lesson" button to the last section
    if (lessonSections.length > 0) {
      lessonSections[lessonSections.length - 1].appendChild(completeLessonBtn);
    }

    // Event listener for "Start Lesson" button
    startLessonBtn.addEventListener("click", () => {
      lessonContent.style.display = "block";
      showSection(0); // Show the first section
      startLessonBtn.style.display = "none";
    });
  }

  // Function to show a specific section and hide others
  function showSection(index) {
    lessonSections.forEach((section) => (section.style.display = "none"));

    if (lessonSections[index]) {
      lessonSections[index].style.display = "block";
      currentSectionIndex = index;

      // Show "Complete Lesson" button on the last section
      if (index === lessonSections.length - 1) {
        completeLessonBtn.style.display = "block";
      } else {
        completeLessonBtn.style.display = "none";
      }
    }
  }

  // Fetch lesson data when the page loads
  fetchLessonData();
});
