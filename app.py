async function getResults() {
  const url = document.getElementById("urlInput").value;
  const output = document.getElementById("output");

  if (!url) {
    output.textContent = "Please enter a Rightmove URL.";
    return;
  }

  try {
    const response = await fetch(`http://127.0.0.1:5000/scrape?url=${encodeURIComponent(url)}`);
    const data = await response.json();

    if (data.results) {
      output.textContent = `Number of results: ${data.results}`;
      displayHistory(data.history);
    } else {
      output.textContent = `Error: ${data.error}`;
    }
  } catch (err) {
    output.textContent = "Failed to connect to backend.";
  }
}

async function loadHistory() {
  const response = await fetch("http://127.0.0.1:5000/history");
  const history = await response.json();
  displayHistory(history);
}

function displayHistory(history) {
  const output = document.getElementById("output");
  let html = "<h3>Results History:</h3><ul>";
  history.forEach(entry => {
    html += `<li>${entry.date}: ${entry.results} results</li>`;
  });
  html += "</ul>";
  output.innerHTML += html;
}

window.onload = loadHistory;
