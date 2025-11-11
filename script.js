// ===============================
// Simon Game - Full Version
// With Difficulty Modes, Achievements, Leaderboard, and Current Mode Display
// ===============================

let buttonColors = ["red", "blue", "green", "yellow"];
let gamePattern = [];
let userPattern = [];
let level = 0;
let gameStarted = false;

let highScores = []; // Endless mode leaderboard only
let currentDifficultyKey = null; // "easy", "medium", etc.

// Difficulty settings
const difficulties = {
  easy: { maxRounds: 10, speedModifier: 1.0 },
  medium: { maxRounds: 15, speedModifier: 0.8 },
  hard: { maxRounds: 20, speedModifier: 0.6 },
  impossible: { maxRounds: 25, speedModifier: 0.5 },
  endless: { maxRounds: Infinity, speedModifier: 0.7 },
};

// Achievements
let achievements = [
  { id: 1, name: "Level 5 Master", description: "Reach Level 5", unlocked: false },
  { id: 2, name: "Level 10 Expert", description: "Reach Level 10", unlocked: false },
  { id: 3, name: "Level 20 Legend", description: "Reach Level 20", unlocked: false },
  { id: 4, name: "Flawless Round", description: "Complete a level without mistakes", unlocked: false },
  { id: 5, name: "Comeback King", description: "Lose after reaching Level 10", unlocked: false },
  { id: 6, name: "Consistency Champ", description: "Play 3 games in a row", unlocked: false },
  { id: 7, name: "Easy Conqueror", description: "Beat Easy Mode", unlocked: false },
  { id: 8, name: "Medium Conqueror", description: "Beat Medium Mode", unlocked: false },
  { id: 9, name: "Hard Conqueror", description: "Beat Hard Mode", unlocked: false },
  { id: 10, name: "Impossible Conqueror", description: "Beat Impossible Mode", unlocked: false },
];

// ===============================
// Local Storage Functions
// ===============================

function loadHighScores() {
  const saved = localStorage.getItem("highScores");
  if (saved) highScores = JSON.parse(saved);
  displayLeaderboard();
}

function saveHighScores() {
  localStorage.setItem("highScores", JSON.stringify(highScores));
}

function loadAchievements() {
  const saved = localStorage.getItem("achievements");
  if (saved) achievements = JSON.parse(saved);
  displayAchievements();
}

function saveAchievements() {
  localStorage.setItem("achievements", JSON.stringify(achievements));
}

// ===============================
// Display Functions
// ===============================

function displayLeaderboard() {
  const list = $("#score-list");
  list.empty();
  if (!highScores || highScores.length === 0) {
    list.append("<li>No high scores yet!</li>");
    return;
  }
  highScores.forEach((score, i) => {
    list.append(`<li>${i + 1}. ${escapeHtml(score.name)} - Level ${score.level}</li>`);
  });
}

function displayAchievements() {
  const list = $("#achievement-list");
  list.empty();
  achievements.forEach((a) => {
    const status = a.unlocked ? "✅" : "❌";
    list.append(`<li>${status} <strong>${escapeHtml(a.name)}</strong> - ${escapeHtml(a.description)}</li>`);
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}

// ===============================
// Achievements System
// ===============================

function unlockAchievement(name) {
  const a = achievements.find(x => x.name === name);
  if (a && !a.unlocked) {
    a.unlocked = true;
    saveAchievements();
    displayAchievements();
    alert("🏆 Achievement Unlocked: " + a.name + "!");
  }
}

// ===============================
// Game Logic
// ===============================

function checkHighScore() {
  if (currentDifficultyKey !== "endless") return;

  if (level > (highScores[2]?.level || 0) || highScores.length < 3) {
    const playerName = prompt("New High Score! Enter your name:");
    if (playerName) {
      const newScore = { name: playerName.trim() || "Anonymous", level: level };
      highScores.push(newScore);
      highScores.sort((a, b) => b.level - a.level);
      if (highScores.length > 3) highScores.length = 3;
      saveHighScores();
      displayLeaderboard();
    }
  }
}

function gameOver() {
  $("body").addClass("game-over");
  setTimeout(() => $("body").removeClass("game-over"), 200);
  $("#level-title").text("Game Over, Press Any Key to Restart");
  playSound("wrong");

  if (level >= 10) unlockAchievement("Comeback King");

  let gamesPlayed = parseInt(localStorage.getItem("gamesPlayed")) || 0;
  gamesPlayed++;
  localStorage.setItem("gamesPlayed", gamesPlayed);
  if (gamesPlayed >= 3) unlockAchievement("Consistency Champ");

  checkHighScore();
  setTimeout(startOver, 1000);
}

function startOver() {
  level = 0;
  gamePattern = [];
  userPattern = [];
  gameStarted = false;
  currentDifficultyKey = null;
  $("#difficulty-menu").show();
  $("#level-title").text("Select a Difficulty to Begin");
  $("#current-mode").text("Current Mode: None");
  loadHighScores();
}

// ===============================
// Sequence Generation
// ===============================

function nextSequence() {
  userPattern = [];
  level++;
  $("#level-title").text("Level " + level);
  updateBackground();

  if (level === 5) unlockAchievement("Level 5 Master");
  if (level === 10) unlockAchievement("Level 10 Expert");
  if (level === 20) unlockAchievement("Level 20 Legend");

  const diffObj = difficulties[currentDifficultyKey];

  if (level > diffObj.maxRounds && Number.isFinite(diffObj.maxRounds)) {
    const modeName = capitalise(currentDifficultyKey);
    $("#level-title").text(`🏆 You Beat ${modeName} Mode!`);
    unlockAchievement(`${modeName} Conqueror`);
    playSound("success");
    setTimeout(() => gameOver(), 1500);
    return;
  }

  const randomNumber = Math.floor(Math.random() * 4);
  const randomChosenColor = buttonColors[randomNumber];
  gamePattern.push(randomChosenColor);
  flashSequence();
}

function flashSequence() {
  let i = 0;
  const baseSpeed = 600;
  const diffObj = difficulties[currentDifficultyKey];
  const speed = Math.max(150, Math.round(baseSpeed * (diffObj ? diffObj.speedModifier : 1)));

  const interval = setInterval(() => {
    const color = gamePattern[i];
    flashButton(color);
    playSound(color);
    i++;
    if (i >= gamePattern.length) clearInterval(interval);
  }, speed);
}

function flashButton(color) {
  const el = $("#" + color);
  el.fadeOut(100).fadeIn(100).addClass("pressed");
  setTimeout(() => el.removeClass("pressed"), 200);
}

function playSound(name) {
  try {
    const audio = new Audio("sounds/" + name + ".mp3");
    audio.play();
  } catch (e) {
    console.warn("Audio play failed:", e);
  }
}

function updateBackground() {
  const hue = (level * 40) % 360;
  $("body").css("background-color", `hsl(${hue}, 70%, 60%)`);
}

// ===============================
// User Interaction
// ===============================

$(".btn").click(function () {
  if (!gameStarted) return;
  const userChosenColor = $(this).attr("id");
  userPattern.push(userChosenColor);
  playSound(userChosenColor);
  flashButton(userChosenColor);
  checkAnswer(userPattern.length - 1);
});

function checkAnswer(currentLevelIndex) {
  if (userPattern[currentLevelIndex] === gamePattern[currentLevelIndex]) {
    if (userPattern.length === gamePattern.length) {
      unlockAchievement("Flawless Round");
      setTimeout(() => nextSequence(), 800);
    }
  } else {
    gameOver();
  }
}

// ===============================
// Difficulty Selection
// ===============================

$(".difficulty-btn").click(function () {
  const diff = $(this).data("diff");
  if (!difficulties.hasOwnProperty(diff)) {
    console.warn("Unknown difficulty:", diff);
    return;
  }

  currentDifficultyKey = diff;
  level = 0;
  gamePattern = [];
  userPattern = [];
  gameStarted = false;

  $("#difficulty-menu").hide();
  $("#level-title").text(`Mode: ${diff.toUpperCase()} — Press Any Key to Start`);
  $("#current-mode").text("Current Mode: " + capitalise(diff));
});

// ===============================
// Keyboard Start
// ===============================

$(document).keydown(function () {
  if (!gameStarted && currentDifficultyKey) {
    level = 0;
    gamePattern = [];
    userPattern = [];
    gameStarted = true;
    nextSequence();
  } else if (!currentDifficultyKey) {
    $("#level-title").text("Please select a difficulty first!");
    setTimeout(() => $("#level-title").text("Select a Difficulty to Begin"), 1200);
  }
});

// ===============================
// Utilities
// ===============================

function capitalise(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ===============================
// Initial Load
// ===============================

$(document).ready(function () {
  loadHighScores();
  loadAchievements();
  $("#difficulty-menu").show();
  $("#current-mode").text("Current Mode: None");
});
