// Function to send log messages to background.js
function logToBackground(message) {
    chrome.runtime.sendMessage({ type: 'log', message: message });
  }
  
  console.log("Content script loaded");
  logToBackground("Content script loaded");
  
  // Variables for tracking typing
  let typingTimer;
  let typingStartTime;
  let typedText = "";
  
  // Typing detection
  document.addEventListener('keydown', (event) => {
    if (!typingTimer) {
      typingStartTime = new Date().getTime();
    }
  
    // Check for printable characters and backspace
    if (event.key.length === 1) {
      typedText += event.key;
    } else if (event.key === 'Backspace') {
      typedText = typedText.slice(0, -1);
    }
  
    console.log(`Key pressed: ${event.key}, Current text: "${typedText}"`);
    logToBackground(`Key pressed: ${event.key}, Current text: "${typedText}"`);
  
    // Reset typing timer
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      if (typedText) {
        const typingEndTime = new Date().getTime();
        const timeSpentTyping = typingEndTime - typingStartTime;
        const timestamp = new Date().toISOString();
  
        console.log(`Typed text: "${typedText}", Time spent typing: ${timeSpentTyping} ms`);
        logToBackground(`Typed text: "${typedText}", Time spent typing: ${timeSpentTyping} ms`);
  
        chrome.storage.local.get(['typingData'], (result) => {
          const typingData = result.typingData || [];
          typingData.push({ timeSpent: timeSpentTyping, text: typedText, timestamp });
          chrome.storage.local.set({ typingData }, () => {
            console.log('Typing data saved:', { timeSpent: timeSpentTyping, text: typedText, timestamp });
            logToBackground('Typing data saved: ' + JSON.stringify({ timeSpent: timeSpentTyping, text: typedText, timestamp }));
            typedText = ""; // Reset typedText here
          });
        });
  
      }
      typingTimer = null;
    }, 500);
  });
  
  // Link click detection
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (link) {
      const timestamp = new Date().toISOString();
      console.log(`Link clicked: ${link.href}, Timestamp: ${timestamp}`);
      logToBackground(`Link clicked: ${link.href}, Timestamp: ${timestamp}`);
  
      chrome.storage.local.get(['clickData'], (result) => {
        const clickData = result.clickData || [];
        clickData.push({ link: link.href, timestamp });
        chrome.storage.local.set({ clickData }, () => {
          console.log('Click data saved:', { link: link.href, timestamp });
          logToBackground('Click data saved: ' + JSON.stringify({ link: link.href, timestamp }));
        });
      });
    }
  });
  
  // Scroll detection
  let scrollTimer;
  let lastScrollPosition = 0;
  
  window.addEventListener('scroll', () => {
    // Update the last scroll position
    lastScrollPosition = window.scrollY;
    
    // Clear any existing timer
    clearTimeout(scrollTimer);
  
    // Set a new timer to handle the end of scrolling
    scrollTimer = setTimeout(() => {
      const timestamp = new Date().toISOString();
  
      console.log(`At ${timestamp}, scrolled to position: ${lastScrollPosition}px`);
      logToBackground(`At ${timestamp}, scrolled to position: ${lastScrollPosition}px`);
  
      // Save the scroll data to Chrome storage
      chrome.storage.local.get(['scrollData'], (result) => {
        const storedScrollData = result.scrollData || [];
        storedScrollData.push({ scrollPosition: lastScrollPosition, timestamp });
        chrome.storage.local.set({ scrollData: storedScrollData }, () => {
          console.log('Scroll data saved:', { scrollPosition: lastScrollPosition, timestamp });
          logToBackground('Scroll data saved: ' + JSON.stringify({ scrollPosition: lastScrollPosition, timestamp }));
        });
      });
    }, 100); // Adjust the interval as needed
  });
  
  // Mouse hover detection with duration check
  let hoverTimer = null;
  
  document.addEventListener('mouseover', (event) => {
    const hoveredElement = event.target;
  
    // Filter out elements that likely contain code or are not paragraphs
    const excludedTags = ['SCRIPT', 'STYLE'];
    if (excludedTags.includes(hoveredElement.tagName) || hoveredElement.tagName !== 'P') {
      return;
    }
  
    // Get text content and remove leading/trailing whitespace
    const hoveredText = hoveredElement.textContent.trim();
  
    // Check if the text content is non-empty
    if (!hoveredText) {
      return;
    }
  
    const x = event.clientX;
    const y = event.clientY;
  
    // Start a timer when user hovers over a paragraph
    hoverTimer = setTimeout(() => {
      const timestamp = new Date().toISOString();
      console.log(`Text hovered for more than 2 seconds: "${hoveredText}", Timestamp: ${timestamp}`);
      logToBackground(`Text hovered for more than 2 seconds: "${hoveredText}", Timestamp: ${timestamp}`);
  
      chrome.storage.local.get(['hoverData'], (result) => {
        const hoverData = result.hoverData || [];
        hoverData.push({ hoverText: hoveredText, timestamp, x, y });
        chrome.storage.local.set({ hoverData }, () => {
          console.log('Hover data saved:', { hoverText: hoveredText, timestamp, x, y });
          logToBackground('Hover data saved: ' + JSON.stringify({ hoverText: hoveredText, timestamp, x, y }));
        });
      });
    }, 1500); // Adjust the duration threshold (2000 milliseconds = 2 seconds)
  });
  
  // Reset timer when user moves away from paragraph
  document.addEventListener('mouseout', () => {
    clearTimeout(hoverTimer);
  });
  
  // Time spent on website
  let visitStartTime = new Date().getTime();
  
  window.addEventListener('beforeunload', () => {
    const visitEndTime = new Date().getTime();
    const timeSpent = visitEndTime - visitStartTime;
    const currentUrl = window.location.href;
    const timestamp = new Date().toISOString();
  
    console.log(`Time spent on ${currentUrl}: ${timeSpent} ms`);
    logToBackground(`Time spent on ${currentUrl}: ${timeSpent} ms`);
  
    chrome.storage.local.get(['websiteTimeData'], (result) => {
      const websiteTimeData = result.websiteTimeData || [];
      websiteTimeData.push({ url: currentUrl, timeSpent, timestamp });
      chrome.storage.local.set({ websiteTimeData }, () => {
        console.log('Website time data saved:', { url: currentUrl, timeSpent, timestamp });
        logToBackground('Website time data saved: ' + JSON.stringify({ url: currentUrl, timeSpent, timestamp }));
      });
    });
  });
  
  const entertainmentSites = ["youtube.com", "netflix.com", "hulu.com", "twitch.tv"];
  
  function isEntertainmentSite(url) {
    return entertainmentSites.some(site => url.includes(site));
  }
  
  if (isEntertainmentSite(window.location.hostname)) {
    let startTime = Date.now();
  
    window.addEventListener('beforeunload', function () {
      let endTime = Date.now();
      let timeSpent = (endTime - startTime) / 1000;
      console.log(`Time spent on this page: ${timeSpent} seconds`);
  
      chrome.storage.local.get({ totalTime: 0 }, function (result) {
        let totalTime = result.totalTime + timeSpent;
        chrome.storage.local.set({ totalTime: totalTime }, function () {
          console.log(`Total time spent on entertainment sites: ${totalTime} seconds`);
        });
      });
    });
  }
  let lastScrollY = 0;
  let scrollTimeout = null;
  let startTime = null;
  let focusedParagraph = null;
  let focusedParagraphLocation = null;
  let focusStartTime = 0;
  
  function checkFocus() {
    let currentTime = new Date().getTime();
    if (focusStartTime && (currentTime - focusStartTime > 20000)) { // 30 seconds
      clearTimeout(scrollTimeout);
      let paragraphs = document.getElementsByTagName("p");
      for (let paragraph of paragraphs) {
        let rect = paragraph.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
          focusedParagraph = paragraph.innerText;
          focusedParagraphLocation = rect.top + window.scrollY;
          console.log("Focused paragraph found:", focusedParagraph); // Debugging
          break;
        }
      }
      console.log("Focused paragraph:", focusedParagraph); // Debugging
      console.log("Focused paragraph location:", focusedParagraphLocation); // Debugging
      console.log("Focused paragraph duration:", currentTime - focusStartTime); // Debugging
    }
  }
  
  window.addEventListener('scroll', () => {
    let currentScrollY = window.scrollY;
    if (currentScrollY !== lastScrollY) {
      lastScrollY = currentScrollY;
      clearTimeout(scrollTimeout);
      startTime = new Date().getTime();
      focusStartTime = new Date().getTime();
      scrollTimeout = setTimeout(checkFocus, 20000); // 30 seconds
    }
  });
  
  // Send the focused paragraph data to the popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getFocusedParagraph") {
      let currentTime = new Date().getTime();
      let focusDuration = currentTime - focusStartTime;
      console.log("Sending focused paragraph:", focusedParagraph); // Debugging
      sendResponse({
        paragraph: focusedParagraph,
        location: focusedParagraphLocation,
        duration: focusDuration
      });
    }
  });
  