let buttonColors = ["red", "blue", "green", "yellow"];
let gamePattern = [];
let userPattern = [];
let level = 0;
let gameStarted = false;
let highScores = [];

// Load high scores from localStorage
function loadHighScores() {
  const savedScores = localStorage.getItem("highScores");
  if (savedScores) {
    highScores = JSON.parse(savedScores);
  }
  displayLeaderboard();
}

// Display the leaderboard
function displayLeaderboard() {
  const scoreList = $("#score-list");
  scoreList.empty();
  highScores.forEach((score, index) => {
    scoreList.append(`<li>${index + 1}. ${score.name} - Level ${score.level}</li>`);
  });
}

// Save high scores to localStorage
function saveHighScores() {
  localStorage.setItem("highScores", JSON.stringify(highScores));
}

// Handle when game is over and check if the score is a high score
function gameOver() {
  $("body").addClass("game-over");
  setTimeout(() => $("body").removeClass("game-over"), 200);
  $("#level-title").text("Game Over, Press Any Key to Restart");
  playSound("wrong");

  // Check if the current score is a high score
  if (level > highScores[2]?.level || highScores.length < 3) {
    const playerName = prompt("New High Score! Enter your name:");
    const newScore = { name: playerName, level: level };
    highScores.push(newScore);
    highScores.sort((a, b) => b.level - a.level); // Sort in descending order by score
    if (highScores.length > 3) highScores.pop(); // Keep only top 3
    saveHighScores();
    displayLeaderboard();
  }

  startOver();
}

// Restart the game
function startOver() {
  level = 0;
  gamePattern = [];
  gameStarted = false;
  loadHighScores(); // Reload high scores after game over
}

$(document).keydown(function() {
  if (!gameStarted) {
    $("#level-title").text("Level " + level);
    nextSequence();
    gameStarted = true;
  }
});

$(".btn").click(function() {
  const userChosenColor = $(this).attr("id");
  userPattern.push(userChosenColor);
  playSound(userChosenColor);
  flashButton(userChosenColor);
  checkAnswer(userPattern.length - 1);
});

function checkAnswer(currentLevel) {
  if (userPattern[currentLevel] === gamePattern[currentLevel]) {
    if (userPattern.length === gamePattern.length) {
      setTimeout(function() {
        $("#level-title").text("Level " + level);
        nextSequence();
      }, 1000);
    }
  } else {
    gameOver(); // Trigger the game over function
  }
}

function nextSequence() {
  userPattern = [];
  level++;
  $("#level-title").text("Level " + level);

  // Generate a random color and add it to the gamePattern
  const randomNumber = Math.floor(Math.random() * 4);
  const randomChosenColor = buttonColors[randomNumber];
  gamePattern.push(randomChosenColor);

  flashSequence(); // Show the sequence to the user
}

function flashSequence() {
  let i = 0;
  const interval = setInterval(() => {
    const color = gamePattern[i];
    flashButton(color);
    playSound(color);
    i++;
    if (i >= gamePattern.length) clearInterval(interval);
  }, 600);
}

function flashButton(color) {
  $("#" + color)
    .fadeOut(100)
    .fadeIn(100)
    .addClass("pressed");
  setTimeout(() => $("#" + color).removeClass("pressed"), 200);
}

function playSound(name) {
  const audio = new Audio("sounds/" + name + ".mp3");
  audio.play();
}

// Initial leaderboard load
loadHighScores();
