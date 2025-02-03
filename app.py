from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import re
import os
from flask_migrate import Migrate

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todo.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-key')
db = SQLAlchemy(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True, expose_headers=["Authorization"])

# Todo Model
class Todo(db.Model):
    task_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    done = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f'<Todo {self.task_id}: {self.name}>'

# User Model (for authentication)
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    todos = db.relationship('Todo', backref='user', lazy=True)
# Helper function to validate passwords
def validate_password(password):
    if len(password) < 8:
        return "Password must be at least 8 characters long"
    if not re.search(r"\d", password):
        return "Password must contain at least one number"
    if not re.search(r"[A-Z]", password):
        return "Password must contain at least one uppercase letter"
    if not re.search(r"[a-z]", password):
        return "Password must contain at least one lowercase letter"
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return "Password must contain at least one special character"
    return None

# Helper function to generate JWT token for a user
def generate_user_token(user_id):
    return create_access_token(identity=user_id)

# Database initialization (this would be run when the app starts)
def create_tables():
    db.create_all()

# Home Route
@app.route('/')
def home():
    if "username" in session:
        return render_template('base.html', username=session["username"])
    else:
        return render_template('base.html')

# Signup Class
class Signup:
    @staticmethod
    def signup():
        data = request.get_json()
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')

        if not email or not username or not password:
            return jsonify({"msg": "Email, username, and password are required"}), 400

        password_error = validate_password(password)
        if password_error:
            return jsonify({"msg": password_error}), 400

        existing_user_email = User.query.filter_by(username=email).first()  # Check for email uniqueness
        existing_user_username = User.query.filter_by(username=username).first()  # Check for username uniqueness
        if existing_user_email:
            return jsonify({"msg": "Email already exists"}), 400
        if existing_user_username:
            return jsonify({"msg": "Username already exists"}), 400

        hashed_password = generate_password_hash(password)
        new_user = User(username=username, password=hashed_password, email=email)  # Assuming you've added an email field to User model
        db.session.add(new_user)
        db.session.commit()

        access_token = generate_user_token(new_user.id)

        return jsonify({"msg": "User created successfully", "access_token": access_token}), 201

# Login Class
class Login:
    @staticmethod
    def login():
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password, password):
            access_token = create_access_token(identity=user.id)
            return jsonify(access_token=access_token), 200

        return jsonify({"msg": "Invalid credentials"}), 401

# Signup Route - Create a new user
@app.route('/signup', methods=['POST'])
def signup_route():
    return Signup.signup()

# Login Route - Authenticate user and return JWT token
@app.route('/login', methods=['POST'])
def login_route():
    return Login.login()

# Get Todos (protected route, requires JWT)
@app.route('/api/todos', methods=['GET'])
@jwt_required()
def get_todos():
    current_user = get_jwt_identity()
    todo_list = Todo.query.filter_by(user_id=current_user).all()
    return jsonify([{"task_id": t.task_id, "name": t.name, "done": t.done} for t in todo_list])

# Add Todo (protected route, requires JWT)
@app.route('/api/todos', methods=['POST'])
@jwt_required()
def add_todo():
    data = request.get_json()
    name = data.get('name')
    if not name:
        return jsonify({"msg": "Todo name is required"}), 400

    current_user = get_jwt_identity()
    new_todo = Todo(name=name, user_id=current_user)
    db.session.add(new_todo)
    db.session.commit()

    return jsonify({'task_id': new_todo.task_id, 'name': new_todo.name, 'done': new_todo.done})

# Update Todo (protected route, requires JWT)
@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
@jwt_required()
def update_todo(todo_id):
    todo = Todo.query.get(todo_id)
    if not todo:
        return jsonify({'message': 'Task not found'}), 404
    todo.done = not todo.done
    db.session.commit()
    return jsonify({'task_id': todo.task_id, 'name': todo.name, 'done': todo.done})

# Delete Todo (protected route, requires JWT)
@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
@jwt_required()
def delete_todo(todo_id):
    todo = Todo.query.get(todo_id)
    if not todo:
        return jsonify({'message': 'Task not found'}), 404
    db.session.delete(todo)
    db.session.commit()
    return jsonify({'message': 'Task deleted'})

if __name__ == '__main__':
    # Make sure to set JWT_SECRET_KEY in your environment for production
    app.run(debug=True)