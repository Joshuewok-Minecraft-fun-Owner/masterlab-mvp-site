/* ============================================================
   MASTERLAB AI RELEARN TEST ENGINE
   Generates relearn tests based on weak-spots from previous test attempts.
   File: /masterlab-mvp-site/js/ml-relearn-test-engine.js
   ============================================================ */

const MLRelearnTestEngine = {

    /* ============================================================
       startRelearnTest - Main entry point for relearn test pages
       ============================================================ */
    startRelearnTest(config) {
        const { lesson, course } = config;
        
        // Load vocab weak-spots from previous test failures
        const vocabWeakKey = `ml_vocab_lesson_${lesson}_weakspots`;
        const vocabWeak = JSON.parse(localStorage.getItem(vocabWeakKey) || "[]");
        
        // Build relearn question pool
        let questions = [];
        
        // Add vocab weak-spot questions (from failed vocab questions)
        vocabWeak.forEach((vocabItem, index) => {
            const correctAnswer = vocabItem.def;
            const choices = [
                correctAnswer,
+                "Incorrect definition " + (index + 1),
                "Incorrect definition " + (index + 2),
                "Incorrect definition " + (index + 3)
            ];
            
            // Shuffle choices
            const shuffled = MLRelearnTestEngine.shuffleArray(choices);
            const correctIndex = shuffled.indexOf(correctAnswer);
            
            questions.push({
                q: `ReLearn: What is the definition of "${vocabItem.term}"?`,
                a: shuffled,
                c: correctIndex,
                isVocab: true,
                term: vocabItem.term
            });
        });
        
        // If no weak-spots, show message
        if (questions.length === 0) {
            MLRelearnTestEngine.showNoRelearnNeeded(lesson);
            return;
        }
        
        // Shuffle all questions
        const shuffledQuestions = MLRelearnTestEngine.shuffleArray(questions);
        
        // Render test to container
        MLRelearnTestEngine.renderTest(shuffledQuestions, lesson, course);
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
            console.warn("No #test-container found. Ensure relearn test HTML has this element.");
            return;
        }
        
        let html = '<form id="answer-form"><div class="relearn-intro">';
        html += '<p>This ReLearn test focuses on vocabulary terms you missed. Master these to move forward.</p>';
        html += '</div>';
        
        questions.forEach((q, idx) => {
            const qNum = idx + 1;
            html += `<div class="question" data-q="${qNum}" data-term="${q.term || ''}">`;
            html += `<h3>Question ${qNum}</h3>`;
            html += `<p><strong>${q.q}</strong></p>`;
            html += '<div class="choices">';
            
            q.a.forEach((choice, cIdx) => {
                const inputId = `q${qNum}_c${cIdx}`;
                html += `<label><input type="radio" name="q${qNum}" value="${cIdx}" id="${inputId}"> ${choice}</label><br>`;
            });
            
            html += '</div></div>';
        });
        
        html += '<button type="submit" class="submit-btn">Submit ReLearn Test</button>';
        html += '</form>';
        
        container.innerHTML = html;
        
        // Attach submit handler
        document.getElementById("answer-form").addEventListener("submit", (e) => {
            e.preventDefault();
            MLRelearnTestEngine.submitTest(questions, lesson, course);
        });
    },
    
    // Helper: submit and grade relearn test
    submitTest(questions, lesson, course) {
        const form = document.getElementById("answer-form");
        const answers = {};
        let score = 0;
        const remainingWeakspots = [];
        
        questions.forEach((q, idx) => {
            const qNum = idx + 1;
            const selected = form.querySelector(`input[name="q${qNum}"]:checked`);
            const userAnswer = selected ? parseInt(selected.value) : null;
            answers[`q${qNum}`] = userAnswer;
            
            if (userAnswer === q.c) {
                score++;
            } else {
                // Track remaining weakspots
                if (q.isVocab) {
                    remainingWeakspots.push({
                        term: q.term,
                        def: q.a[q.c]
                    });
                }
            }
        });
        
        // Calculate percentage
        const percentage = Math.round((score / questions.length) * 100);
        
        // Store relearn results
        const key = `ml_relearn_test_${lesson}_results_${new Date().getTime()}`;
        localStorage.setItem(key, JSON.stringify({
            lesson,
            course,
            score,
            total: questions.length,
            percentage,
            answers,
            timestamp: new Date().toISOString()
        }));
        
        // Clear weak-spots if 100% score
        if (percentage === 100) {
            const weakKey = `ml_vocab_lesson_${lesson}_weakspots`;
            localStorage.removeItem(weakKey);
        } else if (remainingWeakspots.length > 0) {
            // Update weak-spots with remaining failures
            const weakKey = `ml_vocab_lesson_${lesson}_weakspots`;
            localStorage.setItem(weakKey, JSON.stringify(remainingWeakspots));
        }
        
        // Show results
        MLRelearnTestEngine.showResults(score, questions.length, percentage, lesson, course);
    },
    
    // Helper: show relearn test results
    showResults(score, total, percentage, lesson, course) {
        const container = document.getElementById("test-container");
        let resultHtml = `
        <div class="test-results">
            <h2>ReLearn Test Complete!</h2>
            <p>You scored <strong>${score} out of ${total}</strong> (${percentage}%)</p>
        `;
        
        if (percentage === 100) {
            resultHtml += '<p class="success">Perfect! All weak-spots mastered. Ready for the next lesson!</p>';
        } else if (percentage >= 80) {
            resultHtml += '<p class="warning">Good progress! Review the flagged terms and try again.</p>';
        } else {
            resultHtml += '<p class="warning">Keep studying. You can retake this relearn test as many times as needed.</p>';
        }
        
        resultHtml += `<a href="/" class="btn">Return to Dashboard</a>`;
        resultHtml += '</div>';
        
        container.innerHTML = resultHtml;
    },
    
    // Helper: show message when no relearn is needed
    showNoRelearnNeeded(lesson) {
        const container = document.getElementById("test-container");
        let html = `
        <div class="no-relearn">
            <h2>No ReLearn Needed!</h2>
            <p>You didn't miss any vocabulary on the main test. Great job!</p>
            <p>You can start the next lesson whenever you're ready.</p>
            <a href="/" class="btn">Return to Dashboard</a>
        </div>
        `;
        
        container.innerHTML = html;
    }
};
