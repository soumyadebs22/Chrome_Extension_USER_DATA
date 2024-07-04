document.addEventListener('DOMContentLoaded', function () {
  // Get data from Chrome storage and display it
  chrome.storage.local.get(['hoverData', 'clickData', 'typingData', 'scrollData', 'websiteTimeData', 'readingSpeedData'], (result) => {
    const hoverData = result.hoverData || [];
    const clickData = result.clickData || [];
    const typingData = result.typingData || [];
    const scrollData = result.scrollData || [];
    const websiteTimeData = result.websiteTimeData || [];
    const readingSpeedData = result.readingSpeedData || { wps: 0 };

    // Format and display the data
    const dataContainer = document.getElementById('dataContainer');
    dataContainer.innerHTML = `
      <h2>Hover Data</h2>
      <table>${createTable(hoverData)}</table>
      <h2>Click Data</h2>
      <table>${createTable(clickData)}</table>
      <h2>Typing Data</h2>
      <table>${createTable(typingData)}</table>
      <h2>Scroll Data</h2>
      <table>${createTable(scrollData)}</table>
      <h2>Time Data</h2>
      <table>${createTable(websiteTimeData)}</table>
      <h2>Reading Speed (Words per Second)</h2>
      <p id="wps">${readingSpeedData.wps ? readingSpeedData.wps.toFixed(2) : '0.00'}</p>
    `;

    // Prepare data for CSV download
    const csvData = {
      hoverData,
      clickData,
      typingData,
      scrollData,
      websiteTimeData,
      readingSpeedData
    };

    const csvContent = convertToCSV(csvData);
    document.getElementById('download-csv').addEventListener('click', () => {
      downloadCSV(csvContent, 'data.csv');
    });
  });
});


//typing speed

document.addEventListener('DOMContentLoaded', () => {
  // Fetch typing data from Chrome storage
  chrome.storage.local.get(['typingData'], (result) => {
    const typingData = result.typingData || [];
    const typingSpeed = calculateTypingSpeed(typingData);
    
    // Display typing speed
    if (typingSpeed !== null) {
      document.getElementById('typingSpeed').innerText = `Typing Speed: ${typingSpeed} characters per minute`;
    } else {
      document.getElementById('typingSpeed').innerText = 'Typing speed not available.';
    }
  });
});

function calculateTypingSpeed(typingData) {
  console.log('Typing Data:', typingData);  // Check typingData content

  if (typingData.length === 0) return null;

  // Calculate total characters typed and total time spent typing
  let totalCharacters = 0;
  let totalTimeSpent = 0;

  typingData.forEach(entry => {
    totalCharacters += entry.text.length;
    totalTimeSpent += entry.timeSpent;
  });

  // Calculate typing speed in characters per minute (CPM)
  const elapsedTimeMinutes = totalTimeSpent / (1000 * 60); // Convert ms to minutes
  const typingSpeed = Math.round(totalCharacters / elapsedTimeMinutes);

  console.log('Typing Speed:', typingSpeed);  // Check calculated typing speed

  return typingSpeed;
}





function createTable(data) {
  if (data.length === 0) return '<tr><td>No data available</td></tr>';
  const keys = Object.keys(data[0]);
  const header = keys.map(key => `<th>${key}</th>`).join('');
  const rows = data.map(item => {
    const row = keys.map(key => `<td>${item[key]}</td>`).join('');
    return `<tr>${row}</tr>`;
  }).join('');
  return `<tr>${header}</tr>${rows}`;
}

function convertToCSV(obj) {
  const rows = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key].length > 0) {
      const headers = Object.keys(obj[key][0]);
      rows.push([key.toUpperCase(), ...headers].join(","));
      obj[key].forEach(item => {
        const values = headers.map(header => item[header]);
        rows.push([key, ...values].join(","));
      });
      rows.push(""); // Blank line between different data types
    }
  }
  return rows.join("\n");
}

function downloadCSV(content, fileName) {
  const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${content}`);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
