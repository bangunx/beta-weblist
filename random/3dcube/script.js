const cube = document.getElementById("cube");
const scene = document.getElementById("scene");
const toggleSpinBtn = document.getElementById("toggleSpin");
const scaleRange = document.getElementById("scaleRange");

let isSpinning = false;
let rotationX = -20;
let rotationY = -30;
let isDragging = false;
let startX = 0;
let startY = 0;

function updateCubeTransform() {
  cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${scaleRange.value})`;
}

function toggleSpin() {
  isSpinning = !isSpinning;
  cube.classList.toggle("is-spinning", isSpinning);
  toggleSpinBtn.textContent = isSpinning ? "Stop Spin" : "Start Spin";

  if (!isSpinning) {
    updateCubeTransform();
  }
}

function onPointerDown(event) {
  isDragging = true;
  startX = event.clientX;
  startY = event.clientY;
  cube.classList.remove("is-spinning");
  isSpinning = false;
  toggleSpinBtn.textContent = "Start Spin";
}

function onPointerMove(event) {
  if (!isDragging) {
    return;
  }
  const deltaX = event.clientX - startX;
  const deltaY = event.clientY - startY;
  rotationY += deltaX * 0.5;
  rotationX -= deltaY * 0.5;
  startX = event.clientX;
  startY = event.clientY;
  updateCubeTransform();
}

function onPointerUp() {
  isDragging = false;
}

function init() {
  updateCubeTransform();

  toggleSpinBtn.addEventListener("click", toggleSpin);
  scaleRange.addEventListener("input", () => {
    updateCubeTransform();
  });

  scene.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointerleave", onPointerUp);
}

init();
