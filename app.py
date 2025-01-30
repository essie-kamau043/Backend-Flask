from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import re
from flask_migrate import Migrate

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret' 
db = SQLAlchemy(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True, expose_headers=["Authorization"])


# Todo Model
class Todo(db.Model):
    task_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    done = db.Column(db.Boolean)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    


# User Model (for authentication)
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    todos = db.relationship('Todo', backref='user', lazy=True)



# Helper function to validate passwords
def validate_password(password):
    # Password must be at least 6 characters long and contain a number and a letter
    if len(password) < 6:
        return "Password must be at least 6 characters long"
    if not re.search(r"\d", password):
        return "Password must contain at least one number"
    if not re.search(r"[A-Za-z]", password):
        return "Password must contain at least one letter"
    return None

# Helper function to generate JWT token for a user
def generate_user_token(user_id):
    return create_access_token(identity=user_id)

# Home Route
@app.route('/')
def home():
    return render_template('base.html')

# Signup Route - Create a new user
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    print(f"Received signup request: username={username}, password={password}")
    # Check if fields are provided
    if not username or not password:
        return jsonify({"msg": "Username and password are required"}), 400

    # Validate password
    password_error = validate_password(password)
    if password_error:
        return jsonify({"msg": password_error}), 400

    # Check if user already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"msg": "Username already exists"}), 400

    # Hash the password and save the user
    hashed_password = generate_password_hash(password)
    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    # Auto-login user after signup by generating a token
    access_token = generate_user_token(new_user.id)

    return jsonify({"msg": "User created successfully", "access_token": access_token}), 201

# Login Route - Authenticate user and return JWT token
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json() 
    username = data.get('username')
    password = data.get('password')
    print(f"Received login request: username={username}, password={password}")  

    # Check if the user exists
    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password, password):
        # Create JWT token
        access_token = create_access_token(identity=user.id)
        print(f"Generated token: {access_token}") 
        return jsonify(access_token=access_token), 200
    print("Invalid credentials")
    return jsonify({"msg": "Invalid credentials"}), 401

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
    current_user = get_jwt_identity()
    
    new_task = Todo(name=name, done=False, user_id=current_user)
    db.session.add(new_task)
    db.session.commit()

    return jsonify({'task_id': new_task.task_id, 'name': new_task.name, 'done': new_task.done})

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
    app.run(debug=True)
