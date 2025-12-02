import os
import json
import asyncio
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

# --- AGENT IMPORTS ---
from backend.src.agents.assistant_agent import AssistantAgent
from backend.src.agents.testing_agent import TestingAgent
from backend.src.agents.tutoring_agent import TutoringAgent

load_dotenv()

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev_key_change_me")
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)
jwt = JWTManager(app)

# =========================== DATABASE ===========================
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    courses = db.relationship("Course", backref="author", lazy=True)

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    topic = db.Column(db.String(150), nullable=False)
    subject = db.Column(db.String(150), nullable=False)
    standard = db.Column(db.String(50), nullable=False)

    intro = db.Column(db.Text)
    links = db.Column(db.Text)
    lessons_json = db.Column(db.Text)
    tests_json = db.Column(db.Text)

with app.app_context():
    db.create_all()

# ========================== AUTH APIs ===========================

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Missing fields"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "Username already exists"}), 409

    user = User(username=username, password=generate_password_hash(password))
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"message": "Registered", "token": token, "username": username}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"message": "Success", "token": token, "username": user.username}), 200

# ========================== API ROUTES ===========================

# 1. GET COURSES (Renamed to match React)
@app.route("/api/courses", methods=["GET"])
@jwt_required()
def get_courses():
    uid = get_jwt_identity()
    courses = Course.query.filter_by(user_id=int(uid)).all()

    return jsonify({
        "courses": [
            {"id": c.id, "topic": c.topic,
             "subject": c.subject, "standard": c.standard}
             for c in courses
        ]
    }), 200

# 2. GENERATE COURSE

@app.route("/api/generate", methods=["POST"])
@jwt_required()
async def generate_course():
    uid = get_jwt_identity()
    data = request.get_json()

    topic = data.get("topic")
    subject = data.get("subject")
    standard = data.get("standard")

    if not topic or not subject or not standard:
        return jsonify({"success": False, "message": "Missing fields"}), 400

    # 1. CHECK HISTORY
    saved = Course.query.filter_by(user_id=int(uid), topic=topic,
                                   subject=subject, standard=str(standard)).first()
    if saved:
        print(f"Loading existing course: {saved.id}")
        return jsonify({"success": True, "message": "Loaded from history", "course_id": saved.id})

    try:
        print(f"--- Starting Generation for {topic} ---")
        
        # 2. RUN AGENTS
        assistant = AssistantAgent()
        state = {"standard": standard, "subject": subject, "topic": topic, "raw_study_links": []}
        
        out = await assistant.graph.ainvoke(state)
        print("Assistant Agent finished.")

        tutor = TutoringAgent()
        lessons = await tutor.run(out["instructions"], standard, subject, topic)
        print("Tutoring Agent finished.")

        tester = TestingAgent()
        tests = await tester.run(lessons)
        print("Testing Agent finished.")

        # 3. SAFER JSON PARSING (The Fix)
        
        def safe_json_dump(content):
            if isinstance(content, str):
                return content
            return json.dumps(content)

        course = Course(
            user_id=int(uid), 
            topic=topic, 
            subject=subject, 
            standard=str(standard),
            intro=out.get("student_content", "Welcome to your course"), 
            links=safe_json_dump(out.get("raw_study_links", [])),
            lessons_json=safe_json_dump(lessons), 
            tests_json=safe_json_dump(tests)
        )
        
        db.session.add(course)
        db.session.commit()
        print(f"--- Course Saved: {course.id} ---")

        return jsonify({"success": True, "course_id": course.id}), 201
    
    except Exception as e:
        # 4. PRINT THE REAL ERROR TO TERMINAL
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "message": str(e)}), 500


# 3. GET SINGLE COURSE
@app.route("/api/course/<int:id>", methods=["GET"])
@jwt_required()
def get_course_details(id):
    uid = get_jwt_identity()
    c = Course.query.get_or_404(id)

    if c.user_id != int(uid): 
        return jsonify({"error": "Unauthorized"}), 403

    return jsonify({
        "id": c.id,
        "topic": c.topic, 
        "subject": c.subject, 
        "standard": c.standard,
        "intro": c.intro, 
        "links": json.loads(c.links or "[]"),
        "lessons": json.loads(c.lessons_json or "{}"),
        "tests": json.loads(c.tests_json or "{}")
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)