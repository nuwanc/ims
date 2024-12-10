from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DiagnosticReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id', name='fk_diagnostic_report_patient_id'), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id', name='fk_diagnostic_report_created_by'), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # e.g., xray, ct, mri
    description = db.Column(db.Text, nullable=False)
    diagnosis = db.Column(db.Text, nullable=True)
    comment = db.Column(db.Text, nullable=True)
    updated_by = db.Column(db.Integer, db.ForeignKey('user.id' , name='fk_diagnostic_report_updated_by'), nullable=True)  # Last updated by
    updated_at = db.Column(db.DateTime, nullable=True)  # Last update time
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class DiagnosticImage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.Integer, db.ForeignKey('diagnostic_report.id'), nullable=False)
    data = db.Column(db.LargeBinary, nullable=False)  # Store the encrypted image
    filename = db.Column(db.String(200), nullable=False)  # Original filename
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True)  # Nullable for system-level actions
    action = db.Column(db.String(255), nullable=False)  # E.g., "INSERT", "DELETE"
    table_name = db.Column(db.String(255), nullable=False)
    record_id = db.Column(db.Integer, nullable=True)  # ID of the affected record
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.Text, nullable=True)  # JSON or textual details about the action

class Invoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.Integer, db.ForeignKey('diagnostic_report.id'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    generated_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Finance staff
    cost = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="Unpaid")  # "Paid" or "Unpaid"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
