
let timerInterval;
let startTime = 0;
let endTime = 0;
let remainingTime = 0; // Add a variable to store the remaining time

// Listen for messages from the popup.js
chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((message) => {
    if (message.action === "startTimer") {
      // Start the timer with the provided endTime
      startTimer(message.endTime);
    } else if (message.action === "pauseTimer") {
      // Pause the timer
      pauseTimer();
    } else if (message.action === "resetTimer") {
      // Reset the timer
      resetTimer();
    } else if (message.action === "updateRecommendedTime") {
      // Handle the recommended time update
      // You can save this value or use it as needed
      const recommendedTime = message.recommendedTime;
    } else if (message.action === "updateTimeDisplay") {
      // Update the remaining time
      remainingTime = message.remainingTime;
    }
  });
});

function startTimer(endTimeValue) {
  startTime = Date.now();
  endTime = endTimeValue;
  clearInterval(timerInterval);
  timerInterval = setInterval(updateTimerDisplay, 1000);
}

function updateTimerDisplay() {
  const currentTime = Date.now();
  remainingTime = Math.max(0, (endTime - currentTime) / 1000);

  if (remainingTime === 0) {
    clearInterval(timerInterval);
  }

  // Send remainingTime to popup.js to update the display
  chrome.runtime.sendMessage({ action: "updateTimeDisplay", remainingTime });
}

function pauseTimer() {
  clearInterval(timerInterval);
}

function resetTimer() {
  clearInterval(timerInterval);
  startTime = 0;
  endTime = 0;
}
