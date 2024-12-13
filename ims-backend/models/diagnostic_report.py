from datetime import datetime
from extensions import db

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