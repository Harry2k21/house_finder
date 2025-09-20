from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app)  #allow frontend JS to call backend

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
        return jsonify({"results": result_count.text.strip()})
    else:
        return jsonify({"error": "Could not find results count"}), 500

if __name__ == "__main__":
    app.run(debug=True)
