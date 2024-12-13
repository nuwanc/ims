from datetime import datetime
from extensions import db

class Invoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.Integer, db.ForeignKey('diagnostic_report.id'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    generated_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Finance staff
    cost = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="Unpaid")  # "Paid" or "Unpaid"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)