// Listener for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'log') {
      chrome.storage.local.get(['clickData', 'websiteTimeData', 'typingData', 'scrollData', 'hoverData'], (result) => {
        sendToLLM(
          result.clickData || [],
          result.websiteTimeData || [],
          result.typingData || [],
          result.scrollData || [],
          result.hoverData || []
        );
      });
    } else {
      console.log('Content script log:', message.message);
    }
  });
  
  // Function to send data to the language model for summarization
  function sendToLLM(clickData, websiteTimeData, typingData, scrollData, hoverData) {
    const apiKey = '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';
    const prompt = "Summarize the following user activity data:\n\n";
    const clickText = clickData.map(item => `Clicked URL: ${item.link} at ${item.timestamp}`).join('\n');
    const timeText = websiteTimeData.map(item => `Spent ${item.timeSpent} ms on URL: ${item.url} at ${item.timestamp}`).join('\n');
    const typingText = typingData.map(item => `Typed "${item.text}" for ${item.timeSpent} ms at ${item.timestamp}`).join('\n');
    const scrollText = scrollData.map(item => `Scrolled to ${item.scrollPosition}px at ${item.timestamp}`).join('\n');
    const hoverText = hoverData.map(item => `Hovered over "${item.hoverText}" at ${item.timestamp}`).join('\n');
    const inputText = `${prompt}${clickText}\n\n${timeText}\n\n${typingText}\n\n${scrollText}\n\n${hoverText}`;
  
    console.log('Input to LLM:', inputText);  // Log the input to the LLM
  
    fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: inputText,
      }),
    })
    .then(response => response.json())
    .then(summary => {
      if (Array.isArray(summary) && summary.length > 0 && summary[0].summary_text) {
        console.log('Summary:', summary[0].summary_text);
      } else {
        console.log('Unexpected response format:', summary);
      }
    })
    .catch(error => console.error('Error:', error));
  }
  
    // Clear every 2 minutes (120000 milliseconds)
  
  // Track time spent on entertainment websites
  let entertainmentTabs = {};
  const entertainmentSites = ["youtube.com", "netflix.com", "hulu.com", "twitch.tv"];
  
  chrome.webNavigation.onCompleted.addListener(function (details) {
    if (details.frameId === 0) {
      let url = new URL(details.url);
      if (entertainmentSites.some(site => url.hostname.includes(site))) {
        let tabId = details.tabId;
        if (!entertainmentTabs[tabId]) {
          entertainmentTabs[tabId] = { startTime: Date.now() };
        }
      }
    }
  });
  
  chrome.tabs.onRemoved.addListener(function (tabId) {
    if (entertainmentTabs[tabId]) {
      let endTime = Date.now();
      let timeSpent = (endTime - entertainmentTabs[tabId].startTime) / 1000;
      console.log(`Time spent on tab ${tabId}: ${timeSpent} seconds`);
      delete entertainmentTabs[tabId];
    }
  });
  
  // Function to clear stored data
  function clearData() {
    chrome.storage.local.clear(() => {
      console.log('Chrome storage data cleared');
    });
  }
  
  // Set an interval to clear data every 2 minutes
  setInterval(clearData, 120000);