
// popup.js

let timerInterval;
let startTime = 0;
let endTime = 0;
let customizableTimer = 0;
let recommendedTime = 0; // Add a variable to store the recommended time

// Establish a connection with the background script
const port = chrome.runtime.connect({ name: "popup" });

document.addEventListener("DOMContentLoaded", function () {
  const customMinutesDisplay = document.getElementById("custom-minutes");
  const customSecondsDisplay = document.getElementById("custom-seconds");
  const startButton = document.getElementById("start");
  const pauseButton = document.getElementById("pause");
  const resetButton = document.getElementById("reset");
  const increaseMinutesButton = document.getElementById("increase-minutes");
  const decreaseMinutesButton = document.getElementById("decrease-minutes");
  const increaseSecondsButton = document.getElementById("increase-seconds");
  const decreaseSecondsButton = document.getElementById("decrease-seconds");
  const ratingInput = document.getElementById("rating");
  const questionRatingInput = document.getElementById("question-rating");
  let rt = document.getElementById("recommended-timer");

  // Load timer state from chrome.storage
  loadTimerState();

  startButton.addEventListener("click", startTimer);
  pauseButton.addEventListener("click", pauseTimer);
  resetButton.addEventListener("click", resetTimer);
  increaseMinutesButton.addEventListener("click", increaseMinutes);
  decreaseMinutesButton.addEventListener("click", decreaseMinutes);
  increaseSecondsButton.addEventListener("click", increaseSeconds);
  decreaseSecondsButton.addEventListener("click", decreaseSeconds);

  ratingInput.addEventListener("input", updateRecommendedTime);
  questionRatingInput.addEventListener("input", updateRecommendedTime);

  // Define the calculateRecommendedTime function
  function calculateRecommendedTime(userRating, questionRating) {
    // Implement your custom logic here to calculate recommended time
    // You can use the userRating and questionRating to determine the time
    // Return the recommended time in seconds
    // Example logic:
    return userRating + questionRating; // Adjust this formula as per your requirements
  }

  function startTimer() {
    if (customizableTimer === 0) {
      return;
    }

    if (!timerInterval) {
      // Timer is not running, start it
      startTime = Date.now();

      if (endTime === 0) {
        endTime = startTime + customizableTimer * 1000;
      } else {
        const currentTime = Date.now();
        const remainingTime = endTime - currentTime;
        endTime = startTime + remainingTime;
      }

      updateTimerDisplay();

      timerInterval = setInterval(updateTimerDisplay, 1000);

      // Notify the background script to start the timer
      port.postMessage({ action: "startTimer", endTime });
    }
  }



  function updateTimerDisplay() {
    const currentTime = Date.now();
    const remainingTime = Math.max(0, (endTime - currentTime) / 1000);

    customMinutesDisplay.textContent = formatTimeMinutes(remainingTime);
    customSecondsDisplay.textContent = formatTimeSeconds(remainingTime);

    if (remainingTime === 0) {
      clearInterval(timerInterval);
    }
  }

  function pauseTimer() {
    clearInterval(timerInterval);

    // Notify the background script to pause the timer
    port.postMessage({ action: "pauseTimer" });

    // Save timer state to chrome.storage
    saveTimerState();
  }

  function resetTimer() {
    clearInterval(timerInterval);
    customizableTimer = 0;
    customMinutesDisplay.textContent = "00";
    customSecondsDisplay.textContent = "00";

    // Notify the background script to reset the timer
    port.postMessage({ action: "resetTimer" });

    // Save timer state to chrome.storage
    saveTimerState();
  }

  function loadTimerState() {
    chrome.storage.sync.get(["timerState"], function (result) {
      const timerState = result.timerState;
      if (timerState) {
        startTime = timerState.startTime;
        endTime = timerState.endTime;
        customizableTimer = timerState.customizableTimer;

        if (timerState.timerRunning) {
          const remainingTime = Math.max(0, (endTime - Date.now()) / 1000);
          if (remainingTime > 0) {
            startTimer(); // Resume the timer if there's remaining time
          }
        }

        updateTimerDisplay();
      }
    });
  }


  function saveTimerState() {
    const timerState = {
      startTime,
      endTime,
      customizableTimer,
      timerRunning: timerInterval !== undefined,
    };
    chrome.storage.sync.set({ timerState });
  }

  function increaseMinutes() {
    let currentMinutes = parseInt(customMinutesDisplay.textContent, 10);
    currentMinutes++;
    if (currentMinutes > 59) {
      currentMinutes = 0;
    }
    customMinutesDisplay.textContent = currentMinutes < 10 ? `0${currentMinutes}` : currentMinutes;
    updateCustomizableTimer();
  }

  function decreaseMinutes() {
    let currentMinutes = parseInt(customMinutesDisplay.textContent, 10);
    currentMinutes--;
    if (currentMinutes < 0) {
      currentMinutes = 59;
    }
    customMinutesDisplay.textContent = currentMinutes < 10 ? `0${currentMinutes}` : currentMinutes;
    updateCustomizableTimer();
  }

  function increaseSeconds() {
    let currentSeconds = parseInt(customSecondsDisplay.textContent, 10);
    currentSeconds++;
    if (currentSeconds > 59) {
      currentSeconds = 0;
    }
    customSecondsDisplay.textContent = currentSeconds < 10 ? `0${currentSeconds}` : currentSeconds;
    updateCustomizableTimer();
  }

  function decreaseSeconds() {
    let currentSeconds = parseInt(customSecondsDisplay.textContent, 10);
    currentSeconds--;
    if (currentSeconds < 0) {
      currentSeconds = 59;
    }
    customSecondsDisplay.textContent = currentSeconds < 10 ? `0${currentSeconds}` : currentSeconds;
    updateCustomizableTimer();
  }

  function updateCustomizableTimer() {
    const newCustomTimeMinutes = parseInt(customMinutesDisplay.textContent, 10);
    const newCustomTimeSeconds = parseInt(customSecondsDisplay.textContent, 10);
    customizableTimer = newCustomTimeMinutes * 60 + newCustomTimeSeconds;
    saveTimerState();
  }

  function formatTimeMinutes(timeInSeconds) {
    return Math.floor(timeInSeconds / 60);
  }

  function formatTimeSeconds(timeInSeconds) {
    return Math.floor(timeInSeconds % 60);
  }

  function updateRecommendedTime() {
    const userRating = parseFloat(ratingInput.value);
    const questionRating = parseFloat(questionRatingInput.value);

    if (!isNaN(userRating) && !isNaN(questionRating)) {
      recommendedTime = calculateRecommendedTime(userRating, questionRating);
      customMinutesDisplay.textContent = formatTimeMinutes(recommendedTime);
      customSecondsDisplay.textContent = formatTimeSeconds(recommendedTime);
      saveTimerState();
      rt.textContent = `Recommended Time: ${formatTimeMinutes(recommendedTime)}:${formatTimeSeconds(recommendedTime)}`;

      // Notify the background script to update the recommended time
      port.postMessage({ action: "updateRecommendedTime", recommendedTime });
    }
  }

  // Rest of your code ...

// Save timer state when the popup is about to be closed
window.addEventListener("beforeunload", () => {
  saveTimerState();
});

function saveTimerState() {
  const timerState = {
    startTime,
    endTime,
    customizableTimer,
    timerRunning: timerInterval !== undefined,
  };
  chrome.storage.sync.set({ timerState });
}

// Load timer state from chrome.storage when the popup is opened
loadTimerState();


});

