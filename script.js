
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
        } else {
          output.textContent = `Error: ${data.error}`;
        }
      } catch (err) {
        output.textContent = "Failed to connect to backend.";
      }
    }
