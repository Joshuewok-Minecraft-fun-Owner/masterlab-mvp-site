/* ============================================================
   MASTERLAB DASHBOARD CONTROLLER
   Manages dashboard widget updates
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    // Update XP display
    const xpDisplay = document.getElementById("xp-display");
    if (xpDisplay) {
        xpDisplay.textContent = localStorage.getItem("ml_xp") || "0";
    }

    // Update streak display
    const streakDisplay = document.getElementById("streak-display");
    if (streakDisplay) {
        streakDisplay.textContent = localStorage.getItem("ml_streak") || "0";
    }
});
