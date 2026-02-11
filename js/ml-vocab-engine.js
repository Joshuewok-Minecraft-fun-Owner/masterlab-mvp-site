/* ============================================================
   MASTERLAB VOCAB ENGINE — BROWSER AI VERSION
   File: /masterlab-mvp-site/js/ml-vocab-engine.js
   ============================================================ */

const MLVocabEngine = {

    async loadVocab(course, lesson) {
        const ai = await MasterLabAI.generateVocab(course, lesson);

        const vocab = ai?.vocab?.length ? ai.vocab : this.fallbackVocab();

        this.renderVocab(vocab);
    },

    renderVocab(vocab) {
        const container = document.getElementById("lesson-vocab");
        if (!container) return;

        container.innerHTML = "";

        vocab.forEach(v => {
            const row = document.createElement("div");
            row.className = "vocab-row";

            row.innerHTML = `
                <strong>${v.term}</strong>: ${v.definition}
            `;

            container.appendChild(row);
        });
    },

    fallbackVocab() {
        return [
            {
                term: "placeholder term",
                definition: "AI unavailable — this is fallback vocab."
            }
        ];
    }
};
