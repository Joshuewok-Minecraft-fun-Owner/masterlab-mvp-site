/* ============================================================
   MASTERLAB RELEARN ENGINE (MVP)
   Generates ReLearn Blocks inside lessons.
   ============================================================ */

const MLRelearnEngine = {

    /* ------------------------------------------------------------
       Should ReLearn activate?
       ------------------------------------------------------------ */
    shouldActivateRelearn(lesson) {
        if (lesson === 1) return false;

        const key = `ml_lesson_${lesson - 1}_weakspots`;
        const weak = JSON.parse(localStorage.getItem(key) || "[]");

        return weak.length > 0;
    },

    /* ------------------------------------------------------------
       Generate simple ReLearn explanations
       ------------------------------------------------------------ */
    generateExplanation(lesson) {
        return `
            <h3>ReLearn Focus</h3>
            <p>Here are the concepts you struggled with previously. Review them before taking the test.</p>
        `;
    },

    /* ------------------------------------------------------------
       Generate 2–3 micro‑questions
       ------------------------------------------------------------ */
    generateMicroQuestions(lesson) {
        const questions = [
            {
                prompt: `What is one key property used to identify minerals?`,
                choices: ["Hardness", "Color", "Taste", "Smell"],
                correct: "Hardness"
            },
            {
                prompt: `What does “luster” describe?`,
                choices: ["How a mineral breaks", "How a mineral reflects light", "Its density", "Its streak color"],
                correct: "How a mineral reflects light"
            }
        ];

        return questions;
    },

    /* ------------------------------------------------------------
       Render the ReLearn Block into the lesson
       ------------------------------------------------------------ */
    renderRelearnBlock(lesson) {
        const container = document.getElementById("relearn-block");
        if (!container) return;

        if (!this.shouldActivateRelearn(lesson)) {
            container.style.display = "none";
            return;
        }

        const explanation = this.generateExplanation(lesson);
        const micro = this.generateMicroQuestions(lesson);

        let html = `
            <div class="relearn-box">
                ${explanation}
                <h3>Quick Practice</h3>
        `;

        micro.forEach((q, i) => {
            html += `
                <p><strong>${i + 1}.</strong> ${q.prompt}</p>
                ${q.choices.map(c => `
                    <label><input type="radio" name="rl${i}" value="${c}"> ${c}</label><br>
                `).join("")}
            `;
        });

        html += `
            <button onclick="window.location.href='relearn-test-${lesson}.html'">
                Take ReLearn Test
            </button>
            </div>
        `;

        container.innerHTML = html;
    }
};
