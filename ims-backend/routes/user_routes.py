from flask import Blueprint, request, jsonify
from sqlalchemy import not_
from models.user import User
from utils.password_utils import hash_password
from utils.audit_utils import log_audit_action
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from extensions import db

user_routes = Blueprint("user_routes", __name__)

@user_routes.route("/create", methods=["POST"])
@jwt_required()
def create_user():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    data = request.json
    hashed_password = hash_password(data["password"])
    user = User(email=data["email"], password=hashed_password, role=data["role"])
    db.session.add(user)
    db.session.commit()
    log_audit_action(get_jwt_identity(), "INSERT", "users", user.id, {"email": data["email"], "role": data["role"]})
    return jsonify({"message": "User created successfully"}), 201

# List Users (Admin Only)
@user_routes.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    # Get additional claims (role) from the JWT
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    # Get query parameters
    query = request.args.get('query', '').lower()  # Default to an empty string
    
    # Query the database
    users_query = User.query
    if (query == ''):
        users_query = users_query.filter(not_(User.role == 'admin'))
        users = users_query.all()
    else:
        users_query = users_query.filter(
            (User.email.ilike(f"%{query}%")) | (User.id.ilike(f"%{query}%"))
        ) 
        users = users_query.all()
    
    # Log the action
    log_audit_action(
        user_id=get_jwt_identity(),  # Admin who performed the action
        action="SEARCH",
        table_name="users",
        record_id=0,
        details={"query":query,"count":len(users)}
    )

    return jsonify([{'id': u.id, 'email': u.email, 'role': u.role} for u in users])

# Update User (Admin Only)
@user_routes.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    # Get additional claims (role) from the JWT
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.json
    user = User.query.get_or_404(user_id)
    user.email = data.get('email', user.email)
    if 'password' in data:
        user.password = hash_password(data['password'])
    user.role = data.get('role', user.role)
    db.session.commit()
    # Log the action
    log_audit_action(
        user_id=get_jwt_identity(),  # user who performed the action
        action="SEARCH",
        table_name="users",
        record_id=user_id,
        details={"email":data['email'],"role":data['role']}
    )
    return jsonify({'message': 'User updated successfully'})

# Delete User (Admin Only)
@user_routes.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    # Get additional claims (role) from the JWT
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    # Log the action
    log_audit_action(
        user_id=get_jwt_identity(),  # Admin who performed the action
        action="DELETE",
        table_name="users",
        record_id=user_id,
        details={"user":user_id,"action":"Delete user from system."}
    )
    return jsonify({'message': 'User deleted successfully'})


@user_routes.route('/patients', methods=['GET'])
@jwt_required()
def get_users():
    claims = get_jwt()
    if claims.get('role') not in ['admin', 'medical_staff','doctor', 'finance_staff']:
        return jsonify({'message': 'Unauthorized'}), 403

    # Get query parameters
    role = request.args.get('role')
    query = request.args.get('query', '').lower()  # Default to an empty string

    # Query the database
    users_query = User.query
    if role:
        users_query = users_query.filter_by(role=role)
    if query:
        users_query = users_query.filter(
            (User.email.ilike(f"%{query}%")) | (User.id.ilike(f"%{query}%"))
        )

    users = users_query.all()

    # Log the action
    log_audit_action(
        user_id=get_jwt_identity(),  # user who performed the action
        action="SEARCH",
        table_name="users",
        record_id=0,
        details={"query":query,"count":len(users)}
    )

    return jsonify([
        {'id': user.id, 'email': user.email, 'role': user.role}
        for user in users
    ])