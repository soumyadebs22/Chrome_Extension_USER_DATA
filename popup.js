document.addEventListener('DOMContentLoaded', function () {
    // Get data from Chrome storage and display it
    chrome.storage.local.get(['hoverData', 'clickData', 'typingData', 'scrollData', 'websiteTimeData'], (result) => {
      const hoverData = result.hoverData || [];
      const clickData = result.clickData || [];
      const typingData = result.typingData || [];
      const scrollData = result.scrollData || [];
      const websiteTimeData = result.websiteTimeData || [];
  
      // Format and display the data
      const dataContainer = document.getElementById('dataContainer');
      dataContainer.innerHTML = `
        <h2>Hover Data</h2>
        <pre>${JSON.stringify(hoverData, null, 2)}</pre>
        <h2>Click Data</h2>
        <pre>${JSON.stringify(clickData, null, 2)}</pre>
        <h2>Typing Data</h2>
        <pre>${JSON.stringify(typingData, null, 2)}</pre>
        <h2>Scroll Data</h2>
        <pre>${JSON.stringify(scrollData, null, 2)}</pre>
        <h2>Time Data</h2>
        <pre>${JSON.stringify(websiteTimeData, null, 2)}</pre>
  
      `;
    });
  });
  
  document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get({ totalTime: 0 }, function (result) {
      document.getElementById('total-time').textContent = result.totalTime;
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "getFocusedParagraph" }, (response) => {
        if (response) {
          document.getElementById('focused-paragraph').innerText = response.paragraph || "No paragraph focused yet.";
          document.getElementById('focused-paragraph-location').innerText = response.location !== null ? `Location: ${response.location}px` : "Location: Not available";
          document.getElementById('focused-paragraph-duration').innerText = `Duration: ${response.duration / 1000} seconds`;
          console.log("Focused paragraph received:", response.paragraph); // Debugging
          console.log("Focused paragraph location:", response.location); // Debugging
          console.log("Focused paragraph duration:", response.duration); // Debugging
        } else {
          document.getElementById('focused-paragraph').innerText = "No paragraph focused yet.";
          document.getElementById('focused-paragraph-location').innerText = "";
          document.getElementById('focused-paragraph-duration').innerText = "";
        }
      });
    });
  });
  
  
  
  
  