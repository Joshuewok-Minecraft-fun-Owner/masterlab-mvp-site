/* ============================================================
   MASTERLAB AI TEST ENGINE
   Global, course-agnostic test generator for all MasterLab tests.
   File: /masterlab-mvp-site/js/ml-test-engine.js
   ============================================================ */

const MLTestEngine = {

    /* ------------------------------------------------------------
       ATTEMPT TRACKING
       ------------------------------------------------------------ */
    getAttemptNumber(lesson) {
        const key = `ml_test_${lesson}_attempt`;
        const attempt = parseInt(localStorage.getItem(key) || "1");
        return attempt;
    },

    incrementAttempt(lesson) {
        const key = `ml_test_${lesson}_attempt`;
        const attempt = this.getAttemptNumber(lesson);
        localStorage.setItem(key, attempt + 1);
    },

    /* ------------------------------------------------------------
       RELEARN ACTIVATION LOGIC (FIRST ATTEMPT ONLY)
       ------------------------------------------------------------ */
    shouldActivateRelearn(lesson) {
        // Lesson 1 can never have ReLearn (no prior data)
        if (lesson === 1) return false;

        // Example: weak-spot data from previous lesson
        const weakKey = `ml_lesson_${lesson - 1}_weakspots`;
        const weakData = JSON.parse(localStorage.getItem(weakKey) || "[]");

        return weakData.length > 0;
    },

    /* ------------------------------------------------------------
       QUESTION GENERATORS (STUBS / PLACEHOLDERS)
       In the real system, these will pull from your content DB.
       ------------------------------------------------------------ */

    generateLessonQuestions(lesson, count) {
        const questions = [];
        for (let i = 0; i < count; i++) {
            questions.push({
                type: "lesson",
                sourceLesson: lesson,
                prompt: `Lesson ${lesson} concept question #${i + 1}`,
                choices: ["A", "B", "C", "D"],
                correct: ["A", "B", "C", "D"][Math.floor(Math.random() * 4)]
            });
        }
        return questions;
    },

    generateRelearnQuestions(lesson, count) {
        const questions = [];
        for (let i = 0; i < count; i++) {
            questions.push({
                type: "relearn",
                sourceLesson: lesson,
                prompt: `ReLearn question for Lesson ${lesson} #${i + 1}`,
                choices: ["A", "B", "C", "D"],
                correct: ["A", "B", "C", "D"][Math.floor(Math.random() * 4)]
            });
        }
        return questions;
    },

    generatePastQuestions(lesson, count) {
        const questions = [];
        for (let i = 0; i < count; i++) {
            questions.push({
                type: "past",
                sourceLesson: lesson - 1, // example: previous lesson
                prompt: `Past concept review question #${i + 1}`,
                choices: ["A", "B", "C", "D"],
                correct: ["A", "B", "C", "D"][Math.floor(Math.random() * 4)]
            });
        }
        return questions;
    },

    generateVocabQuestions(lesson, mode) {
        const vocabQuestions = [];

        // These are placeholders; in the real system, pull from vocab DB.
        const todayVocab = [
            "inorganic",
            "crystal structure",
            "naturally occurring",
            "definite chemical composition"
        ];

        const pastVocab = [
            "igneous",
            "metamorphic",
            "sedimentary"
        ];

        const relearnVocab = [
            "streak",
            "luster"
        ];

        let pool = [];

        // FINAL VOCAB LOGIC:
        // first attempt: today + relearn + past
        // second attempt: today only
        // third+ attempts: today only
        if (mode === "first") {
            pool = [...todayVocab, ...relearnVocab, ...pastVocab];
        } else {
            pool = [...todayVocab];
        }

        pool.forEach((term, i) => {
            vocabQuestions.push({
                type: "vocab",
                sourceLesson: lesson,
                term,
                prompt: `What is the definition of "${term}"?`,
                choices: ["A", "B", "C", "D"],
                correct: ["A", "B", "C", "D"][Math.floor(Math.random() * 4)]
            });
        });

        return vocabQuestions;
    },

    /* ------------------------------------------------------------
       MAIN TEST GENERATOR
       ------------------------------------------------------------ */
    generateTest(lesson, attempt) {
        // Determine mode based on attempt
        let mode = "first";
        if (attempt === 2) mode = "second";
        if (attempt >= 3) mode = "thirdPlus";

        const relearnActive = (mode === "first") ? this.shouldActivateRelearn(lesson) : false;

        let lessonQuestions = [];
        let relearnQuestions = [];
        let pastQuestions = [];
        let vocabQuestions = [];

        /* FIRST ATTEMPT ---------------------------------------- */
        if (mode === "first") {
            // 6 lesson questions
            lessonQuestions = this.generateLessonQuestions(lesson, 6);

            // ReLearn / Past logic
            if (lesson === 1) {
                // No past exists yet → 4 more lesson questions
                pastQuestions = this.generateLessonQuestions(lesson, 4);
            } else if (relearnActive) {
                // 2 ReLearn + 2 Past
                relearnQuestions = this.generateRelearnQuestions(lesson, 2);
                pastQuestions = this.generatePastQuestions(lesson, 2);
            } else {
                // 4 Past
                pastQuestions = this.generatePastQuestions(lesson, 4);
            }

            // Unlimited vocab (today + relearn + past)
            vocabQuestions = this.generateVocabQuestions(lesson, "first");
        }

        /* SECOND ATTEMPT ---------------------------------------- */
        if (mode === "second") {
            // 10 lesson questions only
            lessonQuestions = this.generateLessonQuestions(lesson, 10);
            // Today’s vocab only
            vocabQuestions = this.generateVocabQuestions(lesson, "second");
        }

        /* THIRD+ ATTEMPTS ---------------------------------------- */
        if (mode === "thirdPlus") {
            // 10 lesson questions only
            lessonQuestions = this.generateLessonQuestions(lesson, 10);
            // Today’s vocab only
            vocabQuestions = this.generateVocabQuestions(lesson, "thirdPlus");
        }

        /* BUILD ANSWER KEY --------------------------------------- */
        const answerKey = {};
        const allQuestions = [
            ...lessonQuestions,
            ...relearnQuestions,
            ...pastQuestions,
            ...vocabQuestions
        ];

        allQuestions.forEach((q, i) => {
            answerKey[`q${i + 1}`] = q.correct;
        });

        return {
            lesson,
            attempt,
            mode,              // "first" | "second" | "thirdPlus"
            relearnActive,
            lessonQuestions,
            relearnQuestions,
            pastQuestions,
            vocabQuestions,
            answerKey
        };
    },
    
    /* ============================================================
       startTest METHOD - Main entry point for test pages
       ============================================================ */
    startTest(config) {
        const { lesson, course, questions } = config;
        
        // Load vocab for this lesson
        const vocabList = window[`vocab_${lesson}`] || [];
        
        // Save vocab to localStorage for test results tracking
        const vocabKey = `ml_vocab_lesson_${lesson}`;
        localStorage.setItem(vocabKey, JSON.stringify(vocabList));
        
        // Build question pool: content questions + vocab questions
        let allQuestions = [...questions];
        
        // Add vocab questions to the pool
        vocabList.forEach((vocabItem, index) => {
            // Create a multiple choice vocab question
            const correctAnswer = vocabItem.def;
            const choices = [
                correctAnswer,
                "Incorrect definition " + (index + 1),
                "Incorrect definition " + (index + 2),
                "Incorrect definition " + (index + 3)
            ];
            
            // Shuffle choices
            const shuffled = MLTestEngine.shuffleArray(choices);
            const correctIndex = shuffled.indexOf(correctAnswer);
            
            allQuestions.push({
                q: `What is the definition of "${vocabItem.term}"?`,
                a: shuffled,
                c: correctIndex,
                isVocab: true,
                term: vocabItem.term
            });
        });
        
        // Shuffle all questions
        const shuffledQuestions = MLTestEngine.shuffleArray(allQuestions);
        
        // Render test to container
        MLTestEngine.renderTest(shuffledQuestions, lesson, course);
    },
    
    // Helper: shuffle array
    shuffleArray(arr) {
        const newArr = [...arr];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    },
    
    // Helper: render test questions to DOM
    renderTest(questions, lesson, course) {
        const container = document.getElementById("test-container");
        if (!container) {
            console.warn("No #test-container found. Ensure test HTML has this element.");
            return;
        }
        
        let html = '<form id="answer-form">';
        
        questions.forEach((q, idx) => {
            const qNum = idx + 1;
            html += `<div class="question" data-q="${qNum}" data-vocab="${q.isVocab ? 'true' : 'false'}" data-term="${q.term || ''}">`;
            html += `<h3>Question ${qNum}</h3>`;
            html += `<p><strong>${q.q}</strong></p>`;
            html += '<div class="choices">';
            
            q.a.forEach((choice, cIdx) => {
                const inputId = `q${qNum}_c${cIdx}`;
                html += `<label><input type="radio" name="q${qNum}" value="${cIdx}" id="${inputId}"> ${choice}</label><br>`;
            });
            
            html += '</div></div>';
        });
        
        html += '<button type="submit" class="submit-btn">Submit Test</button>';
        html += '</form>';
        
        container.innerHTML = html;
        
        // Attach submit handler
        document.getElementById("answer-form").addEventListener("submit", (e) => {
            e.preventDefault();
            MLTestEngine.submitTest(questions, lesson, course);
        });
    },
    
    // Helper: submit and grade test
    submitTest(questions, lesson, course) {
        const form = document.getElementById("answer-form");
        const answers = {};
        let score = 0;
        const weakspots = [];
        
        questions.forEach((q, idx) => {
            const qNum = idx + 1;
            const selected = form.querySelector(`input[name="q${qNum}"]:checked`);
            const userAnswer = selected ? parseInt(selected.value) : null;
            answers[`q${qNum}`] = userAnswer;
            
            if (userAnswer === q.c) {
                score++;
            } else {
                // Track weakspot
                if (q.isVocab) {
                    weakspots.push({
                        term: q.term,
                        def: q.a[q.c]
                    });
                }
            }
        });
        
        // Calculate percentage
        const percentage = Math.round((score / questions.length) * 100);
        
        // Store results
        const key = `ml_test_${lesson}_results_${new Date().getTime()}`;
        localStorage.setItem(key, JSON.stringify({
            lesson,
            course,
            score,
            total: questions.length,
            percentage,
            answers,
            timestamp: new Date().toISOString()
        }));
        
        // Store vocab weakspots for relearn
        if (weakspots.length > 0) {
            const weakKey = `ml_vocab_lesson_${lesson}_weakspots`;
            localStorage.setItem(weakKey, JSON.stringify(weakspots));
        }
        
        // Show results
        MLTestEngine.showResults(score, questions.length, percentage, lesson, course);
    },
    
    // Helper: show test results
    showResults(score, total, percentage, lesson, course) {
        const container = document.getElementById("test-container");
        let resultHtml = `
        <div class="test-results">
            <h2>Test Complete!</h2>
            <p>You scored <strong>${score} out of ${total}</strong> (${percentage}%)</p>
        `;
        
        if (percentage >= 80) {
            resultHtml += '<p class="success">Great work! You passed this lesson.</p>';
        } else {
            resultHtml += '<p class="warning">You need to review this lesson before moving on.</p>';
        }
        
        resultHtml += `<a href="/" class="btn">Return to Dashboard</a>`;
        resultHtml += '</div>';
        
        container.innerHTML = resultHtml;
    }
};
