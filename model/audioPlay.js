const audioPlayBtn = document.querySelector(".audioPlayBtn");
const audio = document.querySelector("#music");
const playIcon = document.querySelector(".play");
const pauseIcon = document.querySelector(".pause");
const audioState = false;

function clickAudioPlayBtnHandler() {
  if (audio.paused) {
    audio.play();
    playIcon.style.display = "none";
    pauseIcon.style.display = "block";
  } else {
    audio.pause();
    playIcon.style.display = "block";
    pauseIcon.style.display = "none";
  }
}
audioPlayBtn.addEventListener("click", clickAudioPlayBtnHandler);
