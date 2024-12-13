from flask import Blueprint, request, jsonify
from models.user import User
from utils.password_utils import check_password
from utils.audit_utils import log_audit_action
from flask_jwt_extended import create_access_token
from extensions import db

auth_routes = Blueprint("auth_routes", __name__)

@auth_routes.route("/login", methods=["POST"])
def login():
    data = request.json
    user = User.query.filter_by(email=data.get("email")).first()
    if user and check_password(data.get("password"), user.password):
        token = create_access_token(identity=user)
        log_audit_action(user.id, "LOGIN", "users", user.id, {"email": user.email})
        return jsonify({"token": token, "role": user.role}), 200
    return jsonify({"message": "Invalid credentials"}), 401

