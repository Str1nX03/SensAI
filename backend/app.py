from flask import Flask, render_template, request
import os

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY")

@app.route("/")
def home():
    return render_template("home.html")

if __name__ == "__main__":
    app.run(debug = True)