document.addEventListener("DOMContentLoaded", () => {
  const titleEl = document.getElementById("ml-header-title");
  const toggleEl = document.getElementById("ml-audio-toggle-global");

  if (window.ML_PAGE_TITLE) {
    titleEl.textContent = window.ML_PAGE_TITLE;
  } else {
    titleEl.textContent = "MasterLab";
  }

  toggleEl.addEventListener("click", () => {
    if (window.MLAudioEngine) {
      MLAudioEngine.toggleFromHeader();
    }
  });

  if (window.ML_IS_TEST === true) {
    document.getElementById("ml-header-logo").style.pointerEvents = "none";
  }
});
