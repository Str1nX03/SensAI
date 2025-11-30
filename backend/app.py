import os
import json
import sys
from flask import Flask, render_template, request, redirect, url_for, session, flash
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

project_root = os.path.abspath(os.path.join(os.getcwd(), '..')) 
if project_root not in sys.path:
    sys.path.append(project_root)

from backend.src.agents.assistant_agent import AssistantAgent
from backend.src.agents.testing_agent import TestingAgent
from backend.src.agents.tutoring_agent import TutoringAgent

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "super_secret_dev_key")

# --- Database Config ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- Database Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    courses = db.relationship('Course', backref='author', lazy=True)

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    topic = db.Column(db.String(150), nullable=False)
    subject = db.Column(db.String(150), nullable=False)
    standard = db.Column(db.Integer, nullable=False)
    
    intro = db.Column(db.Text, nullable=True)
    links = db.Column(db.Text, nullable=True)
    
    lessons_json = db.Column(db.Text, nullable=True) 
    tests_json = db.Column(db.Text, nullable=True)

# Initialize Database
with app.app_context():
    db.create_all()

# --- Helpers ---
def check_auth():
    return 'user_id' in session

# --- Routes ---

@app.route('/')
def home():
    return render_template('landing.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')

        if not username or not password:
            flash("Username and password are required.", "error")
            return redirect(url_for('register'))

        if User.query.filter_by(username=username).first():
            flash("Username already exists.", "error")
            return redirect(url_for('register'))

        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        new_user = User(username=username, password=hashed_password)
        
        try:
            db.session.add(new_user)
            db.session.commit()
            flash("Registration successful! Please login.", "success")
            return redirect(url_for('login'))
        except Exception as e:
            flash("Registration failed.", "error")
            return redirect(url_for('register'))

    return render_template('login.html', mode='register')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            session['username'] = user.username
            flash(f"Welcome back, {user.username}!", "success")
            return redirect(url_for('dashboard'))
        else:
            flash("Invalid credentials.", "error")
            return redirect(url_for('login'))
            
    return render_template('login.html', mode='login')

@app.route('/logout')
def logout():
    session.clear()
    flash("Logged out.", "info")
    return redirect(url_for('home'))

@app.route('/dashboard')
def dashboard():
    if not check_auth():
        flash("Please login.", "error")
        return redirect(url_for('login'))
    
    user_courses = Course.query.filter_by(user_id=session['user_id']).order_by(Course.id.desc()).all()
    return render_template('dashboard.html', user=session.get('username'), courses=user_courses)

@app.route('/course/<int:course_id>')
def view_course(course_id):
    if not check_auth():
        return redirect(url_for('login'))
    
    course = Course.query.get_or_404(course_id)
    if course.user_id != session['user_id']:
        flash("Unauthorized.", "error")
        return redirect(url_for('dashboard'))
    
    lessons = json.loads(course.lessons_json) if course.lessons_json else {}
    tests = json.loads(course.tests_json) if course.tests_json else {}
    
    return render_template(
        'product.html',
        topic=course.topic,
        subject=course.subject,
        standard=course.standard,
        intro=course.intro,
        links=course.links,
        lessons=lessons,
        tests=tests
    )

@app.route('/product', methods=['POST'])
async def product():
    """
    Orchestrates the 3 AI Agents Asynchronously.
    """
    if not check_auth():
        flash("Please login.", "error")
        return redirect(url_for('login'))

    topic = request.form.get('topic')
    subject = request.form.get('subject')
    standard = request.form.get('standard')

    if not all([topic, subject, standard]):
        flash("All fields required.", "error")
        return redirect(url_for('dashboard'))

    # Check History
    existing_course = Course.query.filter_by(
        user_id=session['user_id'],
        topic=topic,
        subject=subject,
        standard=int(standard)
    ).first()
    
    if existing_course:
        flash("Course loaded from history.", "success")
        return redirect(url_for('view_course', course_id=existing_course.id))

    try:
        # Phase 1: Assistant
        assistant = AssistantAgent()
        initial_state = {
            "standard": int(standard), 
            "subject": subject, 
            "topic": topic,
            "raw_study_links": [],
            "topic_draft": "",
            "student_content": "",
            "instructions": ""
        }
        
        assistant_output = await assistant.graph.ainvoke(initial_state)
        
        instructions = assistant_output.get('instructions', '')
        student_guide_html = assistant_output.get('student_content', '<p>No guide generated.</p>')
        raw_links_data = assistant_output.get('raw_study_links', [])

        # Phase 2: Tutoring
        tutor = TutoringAgent()
        lessons = await tutor.run(instructions, int(standard), subject, topic)

        # Phase 3: Testing
        tester = TestingAgent()
        tests = await tester.run(lessons)
        
        # Save
        new_course = Course(
            user_id=session['user_id'],
            topic=topic,
            subject=subject,
            standard=int(standard),
            intro=student_guide_html,
            links=json.dumps(raw_links_data),
            lessons_json=json.dumps(lessons),
            tests_json=json.dumps(tests)
        )
        db.session.add(new_course)
        db.session.commit()
        
        flash("Course generated successfully!", "success")

        return render_template(
            'product.html',
            topic=topic,
            subject=subject,
            standard=standard,
            intro=student_guide_html,
            links=raw_links_data,
            lessons=lessons,
            tests=tests
        )

    except Exception as e:
        flash(f"Error during generation: {str(e)}", "error")
        print(f"SERVER ERROR: {e}")
        return redirect(url_for('dashboard'))

# --- NEW FEATURE: DELETE COURSE ---
@app.route('/delete_course/<int:course_id>', methods=['POST'])
def delete_course(course_id):
    """Allows user to delete a specific course from their history."""
    if not check_auth():
        flash("Please login.", "error")
        return redirect(url_for('login'))
    
    course = Course.query.get_or_404(course_id)
    
    # Security Check: Ensure the user owns this course
    if course.user_id != session['user_id']:
        flash("Unauthorized action.", "error")
        return redirect(url_for('dashboard'))
    
    try:
        db.session.delete(course)
        db.session.commit()
        flash("Course deleted successfully.", "success")
    except Exception as e:
        db.session.rollback()
        flash("Error deleting course.", "error")
        print(f"Delete Error: {e}")
        
    return redirect(url_for('dashboard'))

if __name__ == '__main__':
    app.run(debug=True)