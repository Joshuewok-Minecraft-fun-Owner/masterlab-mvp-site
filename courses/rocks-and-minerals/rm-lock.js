/* ============================================================
   MASTERLAB HYBRID LOCK SYSTEM (Rocks & Minerals)
   7-Day Schedule, 10 Lessons
   ============================================================ */

const unlockSchedule = {
    1: [1, 2],
    2: [3],
    3: [4],
    4: [5, 6],
    5: [7],
    6: [8],
    7: [9, 10]
};

// Convert today's date into a "day number" (1–7)
function getCurrentDayNumber() {
    const start = new Date("2026-02-07"); // Day 1
    const today = new Date();
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    return Math.min(Math.max(diff + 1, 1), 7); // clamp 1–7
}

function isLessonUnlocked(lessonNumber) {
    if (lessonNumber === 1) return true;
    const day = getCurrentDayNumber();

    // Check if the lesson is in any unlock list up to today
    let unlockedByDay = false;
    for (let d = 1; d <= day; d++) {
        if (unlockSchedule[d].includes(lessonNumber)) {
            unlockedByDay = true;
            break;
        }
    }

    if (!unlockedByDay) return false;

    // Check sequential completion (except for same-day pairs)
    const previousLesson = lessonNumber - 1;

    // If previous lesson unlocks on the same day, skip dependency
    for (let d = 1; d <= 7; d++) {
        if (unlockSchedule[d].includes(lessonNumber) &&
            unlockSchedule[d].includes(previousLesson)) {
            return true;
        }
    }

    // Otherwise require previous lesson completion
    return localStorage.getItem(`rm_lesson${previousLesson}_completed`) === "true";
}

/* ============================================================
   ENFORCEMENT HELPERS
   ============================================================ */

function enforceLessonLock(lessonNumber) {
    if (!isLessonUnlocked(lessonNumber)) {
        window.location.href = "../rocks.html";
    }
}

function enforceTestLock(lessonNumber) {
    if (!isLessonUnlocked(lessonNumber)) {
        window.location.href = "../rocks.html";
    }
}

window.RMLock = {
    isLessonUnlocked,
    enforceLessonLock,
    enforceTestLock
};
