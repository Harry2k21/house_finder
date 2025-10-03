let count = 0;
const maxRequirements = 20;

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]
  );
}

async function getResults() {
  const url = document.getElementById("urlInput").value;
  const output = document.getElementById("output");
  if (!url) {
    output.textContent = "Please enter a Rightmove URL.";
    return;
  }

  try {
    const response = await fetch(`http://127.0.0.1:5000/scrape?url=${encodeURIComponent(url)}`);
    if (!response.ok) {
      const text = await response.text();
      output.textContent = `Backend error ${response.status}: ${text}`;
      return;
    }

    const data = await response.json();

    if (data.results != null) {
      output.textContent = `Number of results: ${data.results}`;
      if (data.history) {
        displayHistory(data.history);
      } else {
        loadHistory();
      }
    } else {
      output.textContent = `Error: ${data.error || 'Unknown error from backend'}`;
    }
  } catch (err) {
    console.error('getResults error', err);
    output.textContent = "Failed to connect to backend. Check console/network.";
  }
}

async function loadHistory() {
  try {
    const response = await fetch("http://127.0.0.1:5000/history");
    if (!response.ok) {
      console.error('History fetch failed', response.status);
      return;
    }
    const history = await response.json();
    displayHistory(history);
  } catch (err) {
    console.error('loadHistory error', err);
  }
}

function displayHistory(historyData) {
  const historyEl = document.getElementById("history") || createHistoryEl();
  const items = Array.isArray(historyData) ? historyData : [historyData];

  let html = "<h3>Results History:</h3><ul>";
  items.forEach(entry => {
    const date = entry.date || new Date().toLocaleString();
    const results = (entry.results != null) ? entry.results : '—';
    html += `<li>${escapeHtml(date)}: ${escapeHtml(results)} results</li>`;
  });
  html += "</ul>";

  historyEl.innerHTML = html;
}

function createHistoryEl() {
  const el = document.createElement('div');
  el.id = 'history';
  const output = document.getElementById('output');
  output.parentNode.insertBefore(el, output.nextSibling);
  return el;
}

/* ---------------------------
   REQUIREMENTS SAVE / LOAD
---------------------------- */
function saveRequirements() {
  const list = document.getElementById("list");
  const reqs = [];
  list.querySelectorAll(".requirement").forEach(reqDiv => {
    const checkbox = reqDiv.querySelector("input[type=checkbox]");
    const textInput = reqDiv.querySelector("input[type=text]");
    reqs.push({
      checked: checkbox.checked,
      text: textInput.value
    });
  });
  localStorage.setItem("requirements", JSON.stringify(reqs));
}

function loadRequirements() {
  const saved = JSON.parse(localStorage.getItem("requirements") || "[]");
  const list = document.getElementById("list");
  list.innerHTML = "";
  count = 0;
  saved.forEach(req => {
    addRequirement(req.text, req.checked);
  });
}

function addRequirement(text = "", checked = false) {
  if (count >= maxRequirements) return;
  count++;

  const list = document.getElementById("list");

  const reqDiv = document.createElement("div");
  reqDiv.className = "requirement";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = checked;
  checkbox.addEventListener("change", saveRequirements);

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = "Enter requirement...";
  textInput.value = text;
  textInput.addEventListener("input", saveRequirements);

  const delBtn = document.createElement("button");
  delBtn.textContent = "❌";
  delBtn.onclick = () => {
    list.removeChild(reqDiv);
    count--;
    document.getElementById("addBtn").disabled = false;
    saveRequirements();
  };

  reqDiv.appendChild(checkbox);
  reqDiv.appendChild(textInput);
  reqDiv.appendChild(delBtn);

  list.appendChild(reqDiv);

  if (count >= maxRequirements) {
    document.getElementById("addBtn").disabled = true;
  }

  saveRequirements(); // save on add
}

/* ---------------------------
   SHORTLIST SAVE / LOAD
---------------------------- */
let shortlistCount = 0;
const maxShortlist = 20;

function saveShortlist() {
  const list = document.getElementById("shortlist");
  const items = [];
  list.querySelectorAll(".short-item").forEach(itemDiv => {
    const textInput = itemDiv.querySelector("input[type=text]");
    items.push({
      text: textInput.value
    });
  });
  localStorage.setItem("shortlist", JSON.stringify(items));
}

function loadShortlist() {
  const saved = JSON.parse(localStorage.getItem("shortlist") || "[]");
  const list = document.getElementById("shortlist");
  list.innerHTML = "";
  shortlistCount = 0;
  saved.forEach(item => {
    addShortlistItem(item.text);
  });
}

function addShortlistItem(text = "") {
  if (shortlistCount >= maxShortlist) return;
  shortlistCount++;

  const list = document.getElementById("shortlist");

  const itemDiv = document.createElement("div");
  itemDiv.className = "short-item";

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.placeholder = "Enter shortlisted item...";
  textInput.value = text;
  textInput.addEventListener("input", saveShortlist);

  const delBtn = document.createElement("button");
  delBtn.textContent = "❌";
  delBtn.onclick = () => {
    list.removeChild(itemDiv);
    shortlistCount--;
    document.getElementById("addShortBtn").disabled = false;
    saveShortlist();
  };

  itemDiv.appendChild(textInput);
  itemDiv.appendChild(delBtn);
  list.appendChild(itemDiv);

  if (shortlistCount >= maxShortlist) {
    document.getElementById("addShortBtn").disabled = true;
  }

  saveShortlist(); // save on add
}


/* ---------------------------
   PAGE LOAD
---------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  loadHistory();
  loadRequirements();
  loadShortlist();
   // load saved requirements

  const scrapeBtn = document.getElementById("scrapeBtn");
  if (scrapeBtn) scrapeBtn.addEventListener("click", getResults);

  const addBtn = document.getElementById("addBtn");
  if (addBtn) addBtn.addEventListener("click", () => addRequirement());

  const addShortBtn = document.getElementById("addShortBtn");
  if (addShortBtn) addShortBtn.addEventListener("click", () => addShortlistItem());
  
});
