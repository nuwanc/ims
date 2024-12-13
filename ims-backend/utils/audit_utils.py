import json
from datetime import datetime
from extensions import db
from models.audit_log import AuditLog
from flask import g  # To access user information globally


def log_audit_action(user_id, action, table_name, record_id, details):
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        table_name=table_name,
        record_id=record_id,
        details=json.dumps(details),
        timestamp=datetime.utcnow(),
    )
    db.session.add(audit_log)
    db.session.commit()
