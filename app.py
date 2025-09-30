import json
from datetime import date
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app)

HISTORY_FILE = "results_history.json"

def load_history():
    try:
        with open(HISTORY_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_history(history):
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f)

@app.route("/scrape", methods=["GET"])
def scrape():
    url = request.args.get("url")
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)

    soup = BeautifulSoup(response.text, "html.parser")
    result_count = soup.find("div", class_="ResultsCount_resultsCount__Kqeah")

    if result_count:
        count_text = result_count.text.strip()
        today = str(date.today())

        history = load_history()
        existing = next((entry for entry in history if entry["date"] == today), None)

        if existing:
            existing["results"] = count_text
        else:
            history.append({"date": today, "results": count_text})

        save_history(history)
        return jsonify({"results": count_text, "history": history})
    else:
        return jsonify({"error": "Could not find results count"}), 500

@app.route("/history", methods=["GET"])
def history():
    return jsonify(load_history())

if __name__ == "__main__":
    app.run(debug=True)
