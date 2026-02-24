// Session Keep-Alive Web Worker
// Runs in a separate thread to prevent session timeouts
// Posts a message every 60 seconds to trigger synthetic user activity

let intervalId = null;

// Start the keep-alive interval immediately
intervalId = setInterval(() => {
  // Log from worker context
  console.log('Session keep-alive: mousemove event triggered');
  
  // Post message to main thread
  self.postMessage({ type: 'keep-alive' });
}, 60000); // Exactly 60 seconds (60,000ms)

// Handle cleanup if worker is terminated
self.addEventListener('message', (event) => {
  if (event.data.type === 'stop') {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
});
