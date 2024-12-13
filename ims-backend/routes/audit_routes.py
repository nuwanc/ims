from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models.audit_log import AuditLog
from extensions import db

audit_routes = Blueprint("audit_routes", __name__)

@audit_routes.route('/logs', methods=['GET'])
@jwt_required()
def get_audit_logs():
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403

    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).all()
    log_data = [
        {
            'id': log.id,
            'user_id': log.user_id,
            'action': log.action,
            'table_name': log.table_name,
            'record_id': log.record_id,
            'timestamp': log.timestamp,
            'details': log.details,
        }
        for log in logs
    ]
    return jsonify(log_data), 200

@audit_routes.route("/filter", methods=["GET"])
@jwt_required()
def filter_audit_logs():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    # Fetch logs, optionally filtered by query parameters
    action = request.args.get("action")
    table_name = request.args.get("table_name")
    user_id = request.args.get("user_id")

    query = AuditLog.query

    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))
    if table_name:
        query = query.filter(AuditLog.table_name.ilike(f"%{table_name}%"))
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)

    logs = query.order_by(AuditLog.timestamp.desc()).all()

    # Serialize the logs
    log_data = [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "table_name": log.table_name,
            "record_id": log.record_id,
            "timestamp": log.timestamp,
            "details": log.details,
        }
        for log in logs
    ]

    return jsonify(log_data), 200

@audit_routes.route("/summary", methods=["GET"])
@jwt_required()
def get_audit_summary():
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"message": "Unauthorized"}), 403

    # Aggregate data for a summary view
    total_logs = db.session.query(db.func.count(AuditLog.id)).scalar()
    actions_count = db.session.query(AuditLog.action, db.func.count(AuditLog.action)).group_by(AuditLog.action).all()

    summary = {
        "total_logs": total_logs,
        "actions": {action: count for action, count in actions_count}
    }

    return jsonify(summary), 200
