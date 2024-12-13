from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from models.invoice import Invoice
from models.diagnostic_report import DiagnosticReport
from extensions import db
from utils.audit_utils import log_audit_action

invoice_routes = Blueprint("invoice_routes", __name__)

@invoice_routes.route("/create", methods=["POST"])
@jwt_required()
def create_invoice():
    claims = get_jwt()
    if claims.get("role") != "finance_staff":
        return jsonify({"message": "Unauthorized"}), 403

    data = request.json
    report_id = data.get("report_id")
    cost = data.get("cost")

    report = DiagnosticReport.query.get_or_404(report_id)

    invoice = Invoice(
        report_id=report.id,
        patient_id=report.patient_id,
        generated_by=get_jwt_identity(),
        cost=cost,
        status="Unpaid",
    )
    db.session.add(invoice)
    db.session.commit()

    log_audit_action(
        user_id=get_jwt_identity(),
        action="CREATE",
        table_name="invoices",
        record_id=invoice.id,
        details={"report": report_id, "cost": cost},
    )

    return jsonify({"message": "Invoice created successfully", "invoice_id": invoice.id}), 201

@invoice_routes.route("/filter", methods=["GET"])
@jwt_required()
def filter_invoices():
    claims = get_jwt()
    if claims.get("role") != "finance_staff":
        return jsonify({"message": "Unauthorized"}), 403

    status = request.args.get("status")  # "Paid" or "Unpaid"
    query = Invoice.query
    if status:
        query = query.filter(Invoice.status == status)

    invoices = query.all()

    log_audit_action(
        user_id=get_jwt_identity(),
        action="FILTER",
        table_name="invoices",
        record_id=0,
        details={"status": status, "count": len(invoices)},
    )

    return jsonify([
        {
            "id": invoice.id,
            "report_id": invoice.report_id,
            "patient_id": invoice.patient_id,
            "cost": invoice.cost,
            "status": invoice.status,
            "generated_by": invoice.generated_by,
            "created_at": invoice.created_at,
        }
        for invoice in invoices
    ])

@invoice_routes.route("/<int:invoice_id>/pay", methods=["PATCH"])
@jwt_required()
def mark_invoice_paid(invoice_id):
    claims = get_jwt()
    if claims.get("role") != "finance_staff":
        return jsonify({"message": "Unauthorized"}), 403

    invoice = Invoice.query.get_or_404(invoice_id)
    if invoice.status == "Paid":
        return jsonify({"message": "Invoice is already marked as paid"}), 400

    invoice.status = "Paid"
    db.session.commit()

    log_audit_action(
        user_id=get_jwt_identity(),
        action="PAY",
        table_name="invoices",
        record_id=invoice.id,
        details={"status": "Paid"},
    )

    return jsonify({"message": "Invoice marked as paid successfully"}), 200


