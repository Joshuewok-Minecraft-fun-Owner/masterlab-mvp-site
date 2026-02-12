/* ============================================================
   MASTERLAB AI TEST ENGINE — BROWSER AI VERSION
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
        if (lesson === 1) return false;

        const weakKey = `ml_lesson_${lesson - 1}_weakspots`;
        const weakData = JSON.parse(localStorage.getItem(weakKey) || "[]");

        return weakData.length > 0;
    },

    /* ------------------------------------------------------------
       BROWSER AI QUESTION GENERATORS
       ------------------------------------------------------------ */

    async generateAIQuestions(course, lesson, count) {
        const ai = await MasterLabAI.generateTest(course, lesson);

        if (!ai || !ai.questions || ai.questions.length === 0) {
            return this.generateLessonQuestionsFallback(lesson, count);
        }

        return ai.questions.slice(0, count).map(q => ({
            type: "lesson",
            sourceLesson: lesson,
            prompt: q.prompt,
            choices: q.choices,
            correct: q.choices[q.correct]
        }));
    },

    async generateAIVocab(course, lesson, mode) {
        const ai = await MasterLabAI.generateVocab(course, lesson);

        if (!ai || !ai.vocab || ai.vocab.length === 0) {
            return this.generateVocabFallback(lesson, mode);
        }

        return ai.vocab.map(v => ({
            type: "vocab",
            sourceLesson: lesson,
            term: v.term,
            prompt: `What is the definition of "${v.term}"?`,
            choices: ["A", "B", "C", "D"],
            correct: "A"
        }));
    },

    /* ------------------------------------------------------------
       FALLBACK GENERATORS (if AI fails)
       ------------------------------------------------------------ */

    generateLessonQuestionsFallback(lesson, count) {
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

    generateVocabFallback(lesson, mode) {
        return [
            {
                type: "vocab",
                sourceLesson: lesson,
                term: "placeholder term",
                prompt: `What is the definition of "placeholder term"?`,
                choices: ["A", "B", "C", "D"],
                correct: "A"
            }
        ];
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
                sourceLesson: lesson - 1,
                prompt: `Past concept review question #${i + 1}`,
                choices: ["A", "B", "C", "D"],
                correct: ["A", "B", "C", "D"][Math.floor(Math.random() * 4)]
            });
        }
        return questions;
    },

    /* ------------------------------------------------------------
       MAIN TEST GENERATOR
       ------------------------------------------------------------ */
    async generateTest(course, lesson, attempt) {
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
            lessonQuestions = await this.generateAIQuestions(course, lesson, 6);

            if (lesson === 1) {
                pastQuestions = this.generatePastQuestions(lesson, 4);
            } else if (relearnActive) {
                relearnQuestions = this.generateRelearnQuestions(lesson, 2);
                pastQuestions = this.generatePastQuestions(lesson, 2);
            } else {
                pastQuestions = this.generatePastQuestions(lesson, 4);
            }

            vocabQuestions = await this.generateAIVocab(course, lesson, "first");
        }

        /* SECOND ATTEMPT ---------------------------------------- */
        if (mode === "second") {
            lessonQuestions = await this.generateAIQuestions(course, lesson, 10);
            vocabQuestions = await this.generateAIVocab(course, lesson, "second");
        }

        /* THIRD+ ATTEMPTS ---------------------------------------- */
        if (mode === "thirdPlus") {
            lessonQuestions = await this.generateAIQuestions(course, lesson, 10);
            vocabQuestions = await this.generateAIVocab(course, lesson, "thirdPlus");
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
            course,
            lesson,
            attempt,
            mode,
            relearnActive,
            lessonQuestions,
            relearnQuestions,
            pastQuestions,
            vocabQuestions,
            answerKey
        };
    }
};
