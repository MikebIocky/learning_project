document.addEventListener('DOMContentLoaded', () => {
    // Toggle visibility for history sections
    const toggleHistorySection = (sectionId) => {
        const section = document.getElementById(sectionId);
        const header = section.querySelector('h2');
        const container = section.querySelector('.history-list-container');

        if (header && container) {
            header.addEventListener('click', () => {
                container.classList.toggle('collapsed');
                header.classList.toggle('collapsed');
            });
        }
    };

    toggleHistorySection('quiz-section');
    toggleHistorySection('lesson-section');
    toggleHistorySection('writing-section');
    toggleHistorySection('listening-section'); // Add listening-section
});

async function fetchUserActivityHistory() {
    try {
        const response = await fetch('/api/user-history');
        if (!response.ok) throw new Error('Failed to fetch user history.');

        const { quizzes, lessons, writings, listenings } = await response.json(); // Include listenings

        // Populate quizzes
        const quizListContainer = document.getElementById('quiz-history-list');
        if (quizListContainer) {
            quizListContainer.innerHTML = ''; // Clear existing content

            if (quizzes.length > 0) {
                // Group quizzes by type (reading or listening)
                const groupedQuizzes = quizzes.reduce((acc, quiz) => {
                    // Determine quiz type based on quizId or a specific field
                    const quizType = quiz.quizId && quiz.quizId.includes('reading') ? 'reading' : 'listening';
                    if (!acc[quizType]) {
                        acc[quizType] = [];
                    }
                    acc[quizType].push(quiz);
                    return acc;
                }, {});

                for (const quizType in groupedQuizzes) {
                    const quizSection = document.createElement('div');
                    quizSection.classList.add('skill-section');

                    const quizHeading = document.createElement('h3');
                    quizHeading.style.fontSize = '1.2rem';
                    quizHeading.style.color = '#444';
                    quizHeading.textContent = `${quizType.charAt(0).toUpperCase() + quizType.slice(1)} Quizzes`;

                    const historyListContainer = document.createElement('div');
                    historyListContainer.classList.add('history-list-container');

                    const historyList = document.createElement('ul');
                    historyList.classList.add('history-list');

                    groupedQuizzes[quizType].forEach(quiz => {
                        const listItem = document.createElement('li');
                        // Ensure consistent date formatting
                        const timestamp = new Date(quiz.timestamp).toLocaleDateString();
                        listItem.innerHTML = `
                            <strong>Quiz ID:</strong> ${quiz.quizId}<br>
                            <strong>Score:</strong> ${quiz.score}<br>
                            <strong>Percentage:</strong> ${quiz.percentage}%<br>
                            <strong>Completed on:</strong> ${timestamp}
                        `;
                        historyList.appendChild(listItem);
                    });

                    historyListContainer.appendChild(historyList);
                    quizSection.appendChild(quizHeading);
                    quizSection.appendChild(historyListContainer);
                    quizListContainer.appendChild(quizSection);
                }
            } else {
                quizListContainer.innerHTML = '<li class="no-data">No quizzes completed yet.</li>';
            }
        }

        // Populate lessons
        const lessonListContainer = document.getElementById('lesson-history-list');
        if (lessonListContainer) {
            const lessonData = lessons.reduce((acc, lesson) => {
                if (!acc[lesson.lessonId]) {
                    acc[lesson.lessonId] = [];
                }
                acc[lesson.lessonId].push(lesson);
                return acc;
            }, {});

            lessonListContainer.innerHTML = '';

            for (const lessonId in lessonData) {
                const lessonSection = document.createElement('div');
                lessonSection.classList.add('skill-section');

                const lessonHeading = document.createElement('h3');
                lessonHeading.style.fontSize = '1.2rem';
                lessonHeading.style.color = '#444';
                lessonHeading.textContent = lessonId.charAt(0).toUpperCase() + lessonId.slice(1);

                const historyListContainer = document.createElement('div');
                historyListContainer.classList.add('history-list-container');

                const historyList = document.createElement('ul');
                historyList.classList.add('history-list');

                lessonData[lessonId].forEach(lesson => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <strong>Lesson ID:</strong> ${lesson.lessonId}<br>
                        <strong>Completed on:</strong> ${new Date(lesson.completedAt).toLocaleDateString()}
                    `;
                    historyList.appendChild(listItem);
                });

                historyListContainer.appendChild(historyList);
                lessonSection.appendChild(lessonHeading);
                lessonSection.appendChild(historyListContainer);
                lessonListContainer.appendChild(lessonSection);
            }

            if (Object.keys(lessonData).length === 0) {
                lessonListContainer.innerHTML = '<li class="no-data">No lessons completed yet.</li>';
            }
        }

        // Populate writings
        const writingListContainer = document.getElementById('writing-history-list');
        if (writingListContainer) {
            writingListContainer.innerHTML = '';

            const writingList = document.createElement('ul');
            writingList.classList.add('history-list');

            if (writings && writings.length > 0) {
                writings.forEach(writing => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <strong>Task:</strong> ${writing.task}<br>
                        <strong>Word count:</strong> ${writing.wordCount}<br>
                        <strong>Submitted on:</strong> ${new Date(writing.completedAt).toLocaleDateString()}
                    `;
                    writingList.appendChild(listItem);
                });
            } else {
                const noData = document.createElement('li');
                noData.classList.add('no-data');
                noData.textContent = 'No writing submissions yet.';
                writingList.appendChild(noData);
            }

            writingListContainer.appendChild(writingList);
        }

        // Populate listening activities
        const listeningListContainer = document.getElementById('listening-history-list');
        if (listeningListContainer) {
            listeningListContainer.innerHTML = ''; // Clear existing content

            if (listenings.length > 0) {
                listenings.forEach(listening => {
                    const listItem = document.createElement('li');
                    const timestamp = new Date(listening.timestamp).toLocaleDateString();
                    listItem.innerHTML = `
                        <strong>Listening ID:</strong> ${listening.quizId}<br>
                        <strong>Score:</strong> ${listening.score}<br>
                        <strong>Percentage:</strong> ${listening.percentage}%<br>
                        <strong>Completed on:</strong> ${timestamp}
                    `;
                    listeningListContainer.appendChild(listItem);
                });
            } else {
                listeningListContainer.innerHTML = '<li class="no-data">No listening activities completed yet.</li>';
            }
        }
    } catch (error) {
        console.error('Error fetching user history:', error);
    }
}