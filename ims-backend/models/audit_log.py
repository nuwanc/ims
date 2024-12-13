from datetime import datetime
from extensions import db

class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True)  # Nullable for system-level actions
    action = db.Column(db.String(255), nullable=False)  # E.g., "INSERT", "DELETE"
    table_name = db.Column(db.String(255), nullable=False)
    record_id = db.Column(db.Integer, nullable=True)  # ID of the affected record
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.Text, nullable=True)  # JSON or textual details about the action