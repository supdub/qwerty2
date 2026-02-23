const LETTERS = [..."QWERTYUIOPASDFGHJKLZXCVBNM"];
const GAME_TIME = 30;

const scoreEl = document.getElementById("score");
const comboEl = document.getElementById("combo");
const livesEl = document.getElementById("lives");
const timeEl = document.getElementById("time");
const timerFill = document.getElementById("timerFill");
const targetEl = document.getElementById("target");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

let score = 0;
let combo = 1;
let lives = 3;
let timeLeft = GAME_TIME;
let currentTarget = null;
let running = false;
let gameTimer = null;
let turnTimer = null;

const keyMap = new Map();

function buildKeyboard() {
  document.querySelectorAll(".row").forEach((rowEl) => {
    const row = rowEl.dataset.row;
    [...row].forEach((char) => {
      const key = document.createElement("div");
      key.className = "key";
      key.textContent = char;
      keyMap.set(char, key);
      rowEl.appendChild(key);
    });
  });
}

function setStatus(message, tone = "neutral") {
  const colors = {
    neutral: "var(--muted)",
    good: "var(--ok)",
    bad: "var(--bad)",
    alert: "var(--warning)",
  };

  statusEl.textContent = message;
  statusEl.style.color = colors[tone] ?? colors.neutral;
}

function updateHUD() {
  scoreEl.textContent = score;
  comboEl.textContent = `x${combo}`;
  livesEl.textContent = lives;
  timeEl.textContent = timeLeft;
  timerFill.style.width = `${(timeLeft / GAME_TIME) * 100}%`;
}

function clearKeyStates() {
  keyMap.forEach((keyEl) => {
    keyEl.classList.remove("active", "correct", "wrong");
  });
}

function nextTarget() {
  clearTimeout(turnTimer);
  clearKeyStates();

  const prev = currentTarget;
  do {
    currentTarget = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  } while (LETTERS.length > 1 && prev === currentTarget);

  targetEl.textContent = currentTarget;
  targetEl.classList.remove("pop");
  void targetEl.offsetWidth;
  targetEl.classList.add("pop");

  keyMap.get(currentTarget)?.classList.add("active");

  const speed = Math.max(450, 1500 - score * 8);
  turnTimer = setTimeout(() => {
    if (!running) {
      return;
    }

    lives -= 1;
    combo = 1;
    keyMap.get(currentTarget)?.classList.add("wrong");
    setStatus("Too slow!", "bad");
    updateHUD();

    if (lives <= 0) {
      endGame("No lives left.");
      return;
    }

    nextTarget();
  }, speed);
}

function handleCorrectHit() {
  const points = 10 * combo;
  score += points;
  combo += 1;
  keyMap.get(currentTarget)?.classList.remove("active");
  keyMap.get(currentTarget)?.classList.add("correct");
  setStatus(`Nice! +${points} points`, "good");
  updateHUD();
  nextTarget();
}

function handleWrongHit(letter) {
  lives -= 1;
  combo = 1;
  keyMap.get(letter)?.classList.add("wrong");
  keyMap.get(currentTarget)?.classList.remove("active");
  keyMap.get(currentTarget)?.classList.add("wrong");
  setStatus(`${letter} was wrong!`, "bad");
  updateHUD();

  if (lives <= 0) {
    endGame("No lives left.");
    return;
  }

  nextTarget();
}

function handleKeydown(event) {
  if (!running) {
    return;
  }

  const letter = event.key.toUpperCase();
  if (!LETTERS.includes(letter)) {
    return;
  }

  if (letter === currentTarget) {
    handleCorrectHit();
  } else {
    handleWrongHit(letter);
  }
}

function startGame() {
  if (running) {
    return;
  }

  running = true;
  startBtn.textContent = "Running...";
  startBtn.disabled = true;

  setStatus("Game on! Type the target letter.", "alert");
  nextTarget();

  gameTimer = setInterval(() => {
    timeLeft -= 1;
    updateHUD();

    if (timeLeft <= 0) {
      endGame("Time's up!");
    }
  }, 1000);
}

function resetGame() {
  clearInterval(gameTimer);
  clearTimeout(turnTimer);
  running = false;

  score = 0;
  combo = 1;
  lives = 3;
  timeLeft = GAME_TIME;
  currentTarget = null;

  startBtn.textContent = "Start Game";
  startBtn.disabled = false;
  targetEl.textContent = "?";
  setStatus("Press Start to begin.");
  clearKeyStates();
  updateHUD();
}

function endGame(reason) {
  clearInterval(gameTimer);
  clearTimeout(turnTimer);
  running = false;
  startBtn.textContent = "Play Again";
  startBtn.disabled = false;
  setStatus(`${reason} Final score: ${score}.`, "alert");
}

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);
document.addEventListener("keydown", handleKeydown);

buildKeyboard();
updateHUD();
