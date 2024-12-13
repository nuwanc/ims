from flask import Blueprint, jsonify
from models.invoice import Invoice
from models.user import User
from utils.audit_utils import log_audit_action
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from extensions import db

stats_routes = Blueprint("stats_routes", __name__)

@stats_routes.route('/patients/total', methods=['GET'])
@jwt_required()
def get_total_patients():
    claims = get_jwt()
    if claims.get('role') != 'finance_staff':
        return jsonify({'message': 'Unauthorized'}), 403

    total_patients = User.query.filter_by(role='patient').count()
    return jsonify({'total_patients': total_patients})

@stats_routes.route("/invoices/cost", methods=["GET"])
@jwt_required()
def get_total_cost():
    claims = get_jwt()
    if claims.get("role") != "finance_staff":
        return jsonify({"message": "Unauthorized"}), 403

    total_cost = db.session.query(db.func.sum(Invoice.cost)).filter(Invoice.status == "Paid").scalar()

    log_audit_action(
        user_id=get_jwt_identity(),
        action="TOTAL-COST",
        table_name="invoices",
        record_id=0,
        details={"total_cost": total_cost},
    )

    return jsonify({"total_cost": total_cost or 0})

@stats_routes.route("/<int:patient_id>/cost", methods=["GET"])
@jwt_required()
def get_patient_total_cost(patient_id):
    claims = get_jwt()
    if claims.get("role") != "finance_staff":
        return jsonify({"message": "Unauthorized"}), 403

    total_cost = db.session.query(db.func.sum(Invoice.cost)).filter(
        Invoice.patient_id == patient_id, Invoice.status == "Paid"
    ).scalar()

    log_audit_action(
        user_id=get_jwt_identity(),
        action="PATIENT-TOTAL-COST",
        table_name="invoices",
        record_id=patient_id,
        details={"total_cost": total_cost},
    )

    return jsonify({"patient_id": patient_id, "total_cost": total_cost or 0})