// === MasterLab Audio Engine v4 ===
// Everfi-style block-based narration system

const MLAudioEngine = (() => {
  let state = {
    audioOn: true,
    currentBlock: 1,
    courseId: null,
    lessonId: null
  };

  const audioEl = document.createElement("audio");
  audioEl.id = "ml-audio-player";
  audioEl.controls = true;
  document.body.appendChild(audioEl);

  function init(config) {
    state.courseId = config.courseId || "unknown-course";
    state.lessonId = config.lessonId || detectLessonId();
    state.currentBlock = 1;
    updateToggleLabel();
    loadAudioForCurrentBlock();
  }

  function detectLessonId() {
    const match = window.location.pathname.match(/lesson(\d+)/);
    return match ? match[1] : "0";
  }

  function loadAudioForCurrentBlock(forcePlay = false) {
    if (!state.audioOn) {
      audioEl.pause();
      return;
    }

    const src = `/audio/${state.courseId}/lesson${state.lessonId}-block${state.currentBlock}.mp3`;
    audioEl.src = src;

    if (forcePlay) {
      audioEl.play().catch(() => {});
    }
  }

  function updateToggleLabel() {
    const btn = document.getElementById("ml-audio-toggle-global");
    if (btn) {
      btn.textContent = state.audioOn ? "[Audio is ON]" : "[Audio is OFF]";
    }
  }

  function toggleFromHeader() {
    state.audioOn = !state.audioOn;
    updateToggleLabel();
    loadAudioForCurrentBlock(true);
  }

  return {
    init,
    toggleFromHeader
  };
})();
