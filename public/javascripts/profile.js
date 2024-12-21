// Function to toggle the visibility of history sections (quiz, lesson, writing, listening)
document.addEventListener('DOMContentLoaded', () => {
    // Toggle visibility for history sections
    const toggleHistorySection = (sectionId) => {
      const section = document.getElementById(sectionId);
      const header = section.querySelector('h2');
      const container = section.querySelector('.history-list-container');
  
      if (header && container) {
        header.addEventListener('click', () => {
          container.classList.toggle('collapsed'); // Toggle the 'collapsed' class on click
          header.classList.toggle('collapsed');     // Toggle the 'collapsed' class on the header as well
        });
      }
    };
  
    // Call the toggle function for each history section
    toggleHistorySection('quiz-section');
    toggleHistorySection('lesson-section');
    toggleHistorySection('writing-section');
    toggleHistorySection('listening-section');
  });
  
  // Function to fetch and display user activity history
  async function fetchUserActivityHistory() {
    try {
      // Fetch user history data from the server
      const response = await fetch('/api/user-history');
      if (!response.ok) {
        throw new Error('Failed to fetch user history.');
      }
  
      // Parse the JSON response
      const { quizzes, lessons, writings, listenings } = await response.json();
  
      // --- Populate Quizzes Section ---
      const quizListContainer = document.getElementById('quiz-history-list');
      if (quizListContainer) {
        quizListContainer.innerHTML = ''; // Clear existing content
  
        if (quizzes.length > 0) {
          // Group quizzes by type (reading or listening) for better organization
          const groupedQuizzes = quizzes.reduce((acc, quiz) => {
            // Determine quiz type based on quizId (you might need a different field)
            const quizType = quiz.quizId && quiz.quizId.includes('reading') ? 'reading' : 'listening';
            if (!acc[quizType]) {
              acc[quizType] = [];
            }
            acc[quizType].push(quiz);
            return acc;
          }, {});
  
          // Loop through each quiz type (reading, listening)
          for (const quizType in groupedQuizzes) {
            // Create a section for each quiz type
            const quizSection = document.createElement('div');
            quizSection.classList.add('skill-section');
  
            // Create a heading for the quiz type
            const quizHeading = document.createElement('h3');
            quizHeading.style.fontSize = '1.2rem';
            quizHeading.style.color = '#444';
            quizHeading.textContent = `${quizType.charAt(0).toUpperCase() + quizType.slice(1)} Quizzes`;
  
            // Create a container for the quiz list
            const historyListContainer = document.createElement('div');
            historyListContainer.classList.add('history-list-container');
  
            // Create the quiz list (ul element)
            const historyList = document.createElement('ul');
            historyList.classList.add('history-list');
  
            // Loop through each quiz in the current quiz type
            groupedQuizzes[quizType].forEach(quiz => {
              // Create a list item (li) for each quiz
              const listItem = document.createElement('li');
              // Format the timestamp to a readable date
              const timestamp = new Date(quiz.timestamp).toLocaleDateString();
              listItem.innerHTML = `
                  <strong>Quiz ID:</strong> ${quiz.quizId}<br>
                  <strong>Score:</strong> ${quiz.score}<br>
                  <strong>Percentage:</strong> ${quiz.percentage}%<br>
                  <strong>Completed on:</strong> ${timestamp}
              `;
              // Append the list item to the quiz list
              historyList.appendChild(listItem);
            });
  
            // Append elements to build the quiz section structure
            historyListContainer.appendChild(historyList);
            quizSection.appendChild(quizHeading);
            quizSection.appendChild(historyListContainer);
            quizListContainer.appendChild(quizSection);
          }
        } else {
          // Display a "no quizzes" message if there are no quizzes
          quizListContainer.innerHTML = '<li class="no-data">No quizzes completed yet.</li>';
        }
      }
  
      // --- Populate Lessons Section ---
      const lessonListContainer = document.getElementById('lesson-history-list');
      if (lessonListContainer) {
        // Group lessons by lessonId
        const lessonData = lessons.reduce((acc, lesson) => {
          if (!acc[lesson.lessonId]) {
            acc[lesson.lessonId] = [];
          }
          acc[lesson.lessonId].push(lesson);
          return acc;
        }, {});
  
        lessonListContainer.innerHTML = ''; // Clear existing content
  
        // Loop through each lessonId
        for (const lessonId in lessonData) {
          // Create a section for each lesson
          const lessonSection = document.createElement('div');
          lessonSection.classList.add('skill-section');
  
          // Create a heading for the lesson
          const lessonHeading = document.createElement('h3');
          lessonHeading.style.fontSize = '1.2rem';
          lessonHeading.style.color = '#444';
          lessonHeading.textContent = lessonId.charAt(0).toUpperCase() + lessonId.slice(1);
  
          // Create a container for the lesson list
          const historyListContainer = document.createElement('div');
          historyListContainer.classList.add('history-list-container');
  
          // Create the lesson list (ul element)
          const historyList = document.createElement('ul');
          historyList.classList.add('history-list');
  
          // Loop through each lesson with the current lessonId
          lessonData[lessonId].forEach(lesson => {
            // Create a list item (li) for each lesson
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <strong>Lesson ID:</strong> ${lesson.lessonId}<br>
                <strong>Completed on:</strong> ${new Date(lesson.completedAt).toLocaleDateString()}
            `;
            // Append the list item to the lesson list
            historyList.appendChild(listItem);
          });
  
          // Append elements to build the lesson section structure
          historyListContainer.appendChild(historyList);
          lessonSection.appendChild(lessonHeading);
          lessonSection.appendChild(historyListContainer);
          lessonListContainer.appendChild(lessonSection);
        }
  
        // Display a "no lessons" message if there are no lessons
        if (Object.keys(lessonData).length === 0) {
          lessonListContainer.innerHTML = '<li class="no-data">No lessons completed yet.</li>';
        }
      }
  
      // --- Populate Writings Section ---
      const writingListContainer = document.getElementById('writing-history-list');
      if (writingListContainer) {
        writingListContainer.innerHTML = ''; // Clear existing content
  
        // Create the writing list (ul element)
        const writingList = document.createElement('ul');
        writingList.classList.add('history-list');
  
        if (writings && writings.length > 0) {
          // Loop through each writing submission
          writings.forEach(writing => {
            // Create a list item (li) for each writing
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <strong>Task:</strong> ${writing.task}<br>
                <strong>Word count:</strong> ${writing.wordCount}<br>
                <strong>Submitted on:</strong> ${new Date(writing.completedAt).toLocaleDateString()}
            `;
            // Append the list item to the writing list
            writingList.appendChild(listItem);
          });
        } else {
          // Display a "no writings" message if there are no writings
          const noData = document.createElement('li');
          noData.classList.add('no-data');
          noData.textContent = 'No writing submissions yet.';
          writingList.appendChild(noData);
        }
        // Append the writing list to its container
        writingListContainer.appendChild(writingList);
      }
  
      // --- Populate Listening Section ---
      const listeningListContainer = document.getElementById('listening-history-list');
      if (listeningListContainer) {
        listeningListContainer.innerHTML = ''; // Clear existing content
  
        if (listenings.length > 0) {
          // Loop through each listening activity
          listenings.forEach(listening => {
            // Create a list item (li) for each listening
            const listItem = document.createElement('li');
            const timestamp = new Date(listening.timestamp).toLocaleDateString();
            listItem.innerHTML = `
                <strong>Listening ID:</strong> ${listening.quizId}<br>
                <strong>Score:</strong> ${listening.score}<br>
                <strong>Percentage:</strong> ${listening.percentage}%<br>
                <strong>Completed on:</strong> ${timestamp}
            `;
            // Append the list item to the listening list
            listeningListContainer.appendChild(listItem);
          });
        } else {
          // Display a "no listenings" message if there are no listenings
          listeningListContainer.innerHTML = '<li class="no-data">No listening activities completed yet.</li>';
        }
      }
    } catch (error) {
      console.error('Error fetching user history:', error);
    }
  }