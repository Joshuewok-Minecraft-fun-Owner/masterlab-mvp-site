/* ============================================================
   MASTERLAB BROWSER AI CORE
   Course-aware, browser-only AI interface.
   File: /masterlab-mvp-site/js/ml-browser-ai.js
   ============================================================ */

const MasterLabAI = {
    async generateTest(course, lesson) {
        const prompt = `
Generate 10 multiple-choice questions for the course "${course}", Lesson ${lesson}.
Return JSON ONLY in this exact format:
{
  "questions": [
    {
      "prompt": "",
      "choices": ["", "", "", ""],
      "correct": 0
    }
  ]
}
`;

        const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer YOUR_HF_API_KEY"
            },
            body: JSON.stringify({ inputs: prompt })
        });

        const data = await response.json();
        const raw = data[0]?.generated_text || "";

        try {
            return JSON.parse(raw);
        } catch {
            return { questions: [] };
        }
    },

    async generateVocab(course, lesson) {
        const prompt = `
Generate 10 vocabulary terms for the course "${course}", Lesson ${lesson}.
Return JSON ONLY in this exact format:
{
  "vocab": [
    { "term": "", "definition": "" }
  ]
}
`;

        const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer YOUR_HF_API_KEY"
            },
            body: JSON.stringify({ inputs: prompt })
        });

        const data = await response.json();
        const raw = data[0]?.generated_text || "";

        try {
            return JSON.parse(raw);
        } catch {
            return { vocab: [] };
        }
    }
};
