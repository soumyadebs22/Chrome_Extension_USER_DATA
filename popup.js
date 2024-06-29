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
      <table>${createTable(hoverData)}</table>
      <h2>Click Data</h2>
      <table>${createTable(clickData)}</table>
      <h2>Typing Data</h2>
      <table>${createTable(typingData)}</table>
      <h2>Scroll Data</h2>
      <table>${createTable(scrollData)}</table>
      <h2>Time Data</h2>
      <table>${createTable(websiteTimeData)}</table>
    `;

    // Prepare data for CSV download
    const csvData = {
      hoverData,
      clickData,
      typingData,
      scrollData,
      websiteTimeData
    };

    const csvContent = convertToCSV(csvData);
    document.getElementById('download-csv').addEventListener('click', () => {
      downloadCSV(csvContent, 'data.csv');
    });
  });

  chrome.storage.local.get({ totalTime: 0 }, function (result) {
    document.getElementById('total-time').textContent = result.totalTime;
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getFocusedParagraph" }, (response) => {
      if (response) {
        document.getElementById('focused-paragraph').innerText = response.paragraph || "No paragraph focused yet.";
        document.getElementById('focused-paragraph-location').innerText = response.location !== null ? `Location: ${response.location}px` : "Location: Not available";
        console.log("Focused paragraph received:", response.paragraph); // Debugging
        console.log("Focused paragraph location:", response.location); // Debugging
      } else {
        document.getElementById('focused-paragraph').innerText = "No paragraph focused yet.";
        document.getElementById('focused-paragraph-location').innerText = "";
      }
    });
  });
});

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
