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
  
    fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',  // Replace with the correct model name if different
        messages: [{role: 'user', content: inputText}],
        max_tokens: 150,  // Adjust this value as needed
        n: 1,
        stop: null,
        temperature: 0.7
      }),
    })
    .then(response => response.json())
    .then(summary => {
      if (summary.choices && summary.choices.length > 0 && summary.choices[0].message.content) {
        console.log('%cSummary of Data using LLM:', 'font-weight: bold', summary.choices[0].message.content);
      } else {
        console.log('Unexpected response format:', summary);
      }
    })
    .catch(error => console.error('Error:', error));
  }
  
  

  
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

//focusdata
  chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      files: ['content.js']
    });
  });
  
  
  // Function to clear stored data
  function clearData() {
    chrome.storage.local.clear(() => {
      console.log('Chrome storage data cleared');
    });
  }
  
  // Set an interval to clear data every 2 minutes
  setInterval(clearData, 60000);