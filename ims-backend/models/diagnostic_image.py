from datetime import datetime
from extensions import db

class DiagnosticImage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.Integer, db.ForeignKey('diagnostic_report.id'), nullable=False)
    data = db.Column(db.LargeBinary, nullable=False)  # Store the encrypted image
    filename = db.Column(db.String(200), nullable=False)  # Original filename
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)