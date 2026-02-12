/* ============================================================
   XP Reward System for Rocks & Minerals
   ============================================================ */

function addXP(amount) {
    const current = parseInt(localStorage.getItem("ml_xp") || "0");
    const updated = current + amount;
    localStorage.setItem("ml_xp", updated);
    return updated;
}

function rewardLessonXP(lessonNumber) {
    // 50 XP per lesson completion
    addXP(50);
    localStorage.setItem(`rm_lesson${lessonNumber}_xp`, "true");
}

function rewardTestXP(lessonNumber) {
    // 100 XP per test completion
    addXP(100);
    localStorage.setItem(`rm_test${lessonNumber}_xp`, "true");
}

window.RMRewards = {
    addXP,
    rewardLessonXP,
    rewardTestXP
};
