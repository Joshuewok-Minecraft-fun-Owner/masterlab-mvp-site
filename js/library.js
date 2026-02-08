/* ============================================================
   MASTERLAB LIBRARY CONTROLLER
   Renders course library with progress tracking
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    const courses = [
        { name: "Rocks & Minerals", prefix: "rm", lessons: 10, link: "/masterlab-mvp-site/courses/rocks-and-minerals/rocks.html" },
        { name: "CAD Onshape", prefix: "cad", lessons: 10, link: "/masterlab-mvp-site/courses/cad-onshape/cad.html" }
    ];

    const lib = document.getElementById("library");
    
    if (!lib) return;

    courses.forEach(course => {
        let completed = 0;
        for (let i = 1; i <= course.lessons; i++) {
            if (localStorage.getItem(`${course.prefix}_lesson${i}_xp`) === "true") {
                completed++;
            }
        }

        const percent = Math.round((completed / course.lessons) * 100);

        const card = document.createElement("div");
        card.classList.add("lesson-card");
        card.innerHTML = `
            <h3>${course.name}</h3>
            <p>${percent}% complete</p>
            <a class="continue-button" href="${course.link}">Open Course</a>
        `;
        lib.appendChild(card);
    });
});
