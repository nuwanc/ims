from datetime import datetime
from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt, get_jwt_identity
from flask_cors import CORS
from sqlalchemy import not_
from models import db, User, DiagnosticReport, DiagnosticImage, AuditLog, Invoice
from utils import hash_password, check_password, encrypt_data, decrypt_data
from audit_utils import log_audit_action
import os
from werkzeug.utils import secure_filename
from flask_migrate import Migrate

app = Flask(__name__)
# Configure CORS for the app with specific headers and methods
CORS(app, resources={r"/*": {"origins": "*"}}, methods=["GET", "POST", "OPTIONS", "DELETE", "PATCH"], supports_credentials=True)

# Configurations
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'thisismyscreetkey'

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

migrate = Migrate(app, db)

# Initialize Extensions
db.init_app(app)
jwt = JWTManager(app)
# Define how user identity is serialized into the JWT
@jwt.user_identity_loader
def user_identity_lookup(user):
    return str(user.id)

# Define how additional claims are added to the JWT
@jwt.additional_claims_loader
def add_claims_to_access_token(user):
    return {'role': user.role}

# Initialize database and create default admin user
def initialize_database():
    with app.app_context():
        db.create_all()
        if not User.query.filter_by(email="admin@admin").first():
            admin = User(email="admin@admin", password=hash_password("admin123"), role="admin")
            db.session.add(admin)
            db.session.commit()

# Call the initialization function before starting the app
initialize_database()

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data.get('email')).first()
    if user and check_password(data.get('password'), user.password):
        # Pass the user object to `create_access_token`
        token = create_access_token(identity=user)
        # audit login
        log_audit_action(
            user_id=user.id,  # user who performed the action
            action="LOGIN",
            table_name="users",
            record_id=user.id,
            details={"role": user.role, "email": user.email }
        )
        return jsonify({'token': token, 'role': user.role}), 200
    return jsonify({'message': 'Invalid credentials'}), 401


@app.route('/users', methods=['POST'])
@jwt_required()
def create_user():
    # Get additional claims (role) from the JWT
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403

    # Process the request
    data = request.json
    hashed_password = hash_password(data['password'])
    user = User(email=data['email'], password=hashed_password, role=data['role'])
    db.session.add(user)
    db.session.commit()

    # Log the action
    log_audit_action(
        user_id=get_jwt_identity(),  # Admin who performed the action
        action="INSERT",
        table_name="users",
        record_id=user.id,
        details={"email": data['email'], "role": data['role']}
    )
    return jsonify({'message': 'User created successfully'}), 201


# List Users (Admin Only)
@app.route('/users', methods=['GET'])
@jwt_required()
def list_users():
    # Get additional claims (role) from the JWT
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    # Get query parameters
    query = request.args.get('query', '').lower()  # Default to an empty string
    
    # Query the database
    users_query = User.query
    if (query == ''):
        users_query = users_query.filter(not_(User.role == 'admin'))
        users = users_query.all()
    else:
        users_query = users_query.filter(
            (User.email.ilike(f"%{query}%")) | (User.id.ilike(f"%{query}%"))
        ) 
        users = users_query.all()
    
    # Log the action
    log_audit_action(
        user_id=get_jwt_identity(),  # Admin who performed the action
        action="SEARCH",
        table_name="users",
        record_id=0,
        details={"query":query,"count":len(users)}
    )

    return jsonify([{'id': u.id, 'email': u.email, 'role': u.role} for u in users])

@app.route('/patients', methods=['GET'])
@jwt_required()
def get_users():
    claims = get_jwt()
    if claims.get('role') not in ['admin', 'medical_staff','doctor']:
        return jsonify({'message': 'Unauthorized'}), 403

    # Get query parameters
    role = request.args.get('role')
    query = request.args.get('query', '').lower()  # Default to an empty string

    # Query the database
    users_query = User.query
    if role:
        users_query = users_query.filter_by(role=role)
    if query:
        users_query = users_query.filter(
            (User.email.ilike(f"%{query}%")) | (User.id.ilike(f"%{query}%"))
        )

    users = users_query.all()

    # Log the action
    log_audit_action(
        user_id=get_jwt_identity(),  # user who performed the action
        action="SEARCH",
        table_name="users",
        record_id=0,
        details={"query":query,"count":len(users)}
    )

    return jsonify([
        {'id': user.id, 'email': user.email, 'role': user.role}
        for user in users
    ])

# Update User (Admin Only)
@app.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    # Get additional claims (role) from the JWT
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    data = request.json
    user = User.query.get_or_404(user_id)
    user.email = data.get('email', user.email)
    if 'password' in data:
        user.password = hash_password(data['password'])
    user.role = data.get('role', user.role)
    db.session.commit()
    return jsonify({'message': 'User updated successfully'})

# Delete User (Admin Only)
@app.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    # Get additional claims (role) from the JWT
    claims = get_jwt()
    if claims.get('role') != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
    
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    # Log the action
    log_audit_action(
        user_id=get_jwt_identity(),  # Admin who performed the action
        action="DELETE",
        table_name="users",
        record_id=user_id,
        details={"user":user_id,"action":"Delete user from system."}
    )
    return jsonify({'message': 'User deleted successfully'})


# Create Diagnostic reports for a patient
@app.route('/diagnostic-reports', methods=['POST'])
@jwt_required()
def create_diagnostic_report():
    claims = get_jwt()
    if claims.get('role') != 'medical_staff':
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.json
    patient_id = data.get('patient_id')
    report_type = data.get('type')
    description = data.get('description')

    # Validate patient exists
    patient = User.query.filter_by(id=patient_id, role='patient').first()
    if not patient:
        return jsonify({'message': 'Patient not found'}), 404

    # Create diagnostic report
    report = DiagnosticReport(
        patient_id=patient_id,
        created_by=get_jwt_identity(),
        type=report_type,
        description=description,
    )
    db.session.add(report)
    db.session.commit()

        # Log the action
    log_audit_action(
        user_id=get_jwt_identity(),  # User who performed the action
        action="INSERT",
        table_name="reports",
        record_id=report.id,
        details={"type":report_type,"description":description,"patient":patient_id}
    )
    
    return jsonify({'message': 'Diagnostic report created', 'report_id': report.id}), 201

@app.route('/diagnostic-reports/<int:report_id>/images', methods=['POST'])
@jwt_required()
def upload_diagnostic_images(report_id):
    claims = get_jwt()
    if claims.get('role') != 'medical_staff':
        return jsonify({'message': 'Unauthorized'}), 403

    report = DiagnosticReport.query.get_or_404(report_id)

    if 'files' not in request.files:
        return jsonify({'message': 'No files part in the request'}), 400

    files = request.files.getlist('files')
    uploaded_files = []

    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_data = file.read()  # Read file data
            encrypted_data = encrypt_data(file_data)  # Encrypt the file data

            # Save encrypted data and filename in the database
            diagnostic_image = DiagnosticImage(
                report_id=report_id,
                data=encrypted_data,
                filename=filename,
            )
            db.session.add(diagnostic_image)
            uploaded_files.append(filename)

    db.session.commit()
    return jsonify({'message': 'Images uploaded successfully', 'uploaded_files': uploaded_files}), 201

@app.route('/diagnostic-reports/images/<int:image_id>', methods=['GET'])
@jwt_required()
def get_diagnostic_image(image_id):
    claims = get_jwt()
    user_id = get_jwt_identity()
    role = claims.get('role')

    # Retrieve the image and its associated report
    diagnostic_image = DiagnosticImage.query.get_or_404(image_id)
    report = DiagnosticReport.query.get_or_404(diagnostic_image.report_id)

    # Role-based access control
    if role == 'patient' and int(report.patient_id) != int(user_id):
        print('11')
        return jsonify({'message': 'Unauthorized'}), 403
    if role not in ['patient', 'medical_staff', 'doctor']:
        print('22')
        return jsonify({'message': 'Unauthorized'}), 403
    
    print('here')

    # Decrypt and return the image
    decrypted_data = decrypt_data(diagnostic_image.data)
    response = make_response(decrypted_data)
    response.headers.set('Content-Type', 'application/octet-stream')
    response.headers.set(
        'Content-Disposition', f'attachment; filename={diagnostic_image.filename}'
    )
    return response


@app.route('/patients/<int:patient_id>/diagnostic-reports', methods=['GET'])
@jwt_required()
def list_diagnostic_reports(patient_id):
    claims = get_jwt()
    if claims.get('role') not in ['medical_staff', 'doctor']:
        return jsonify({'message': 'Unauthorized'}), 403

    reports = DiagnosticReport.query.filter_by(patient_id=patient_id).all()
    result = []
    for report in reports:
        images = DiagnosticImage.query.filter_by(report_id=report.id).all()
        result.append({
            'id': report.id,
            'type': report.type,
            'description': report.description,
            'created_at': report.created_at,
            'images': [{'id': img.id, 'filename': img.filename} for img in images]
        })

    return jsonify(result)

@app.route('/my-diagnostic-reports', methods=['GET'])
@jwt_required()
def get_my_diagnostic_reports():
    claims = get_jwt()
    if claims.get('role') != 'patient':
        return jsonify({'message': 'Unauthorized'}), 403

    patient_id = get_jwt_identity()  # Assume the patient's ID is the identity
    reports = DiagnosticReport.query.filter_by(patient_id=patient_id).all()

    result = []
    for report in reports:
        images = DiagnosticImage.query.filter_by(report_id=report.id).all()
        result.append({
            'id': report.id,
            'type': report.type,
            'description': report.description,
            'created_at': report.created_at,
            'images': [{'id': img.id, 'filename': img.filename} for img in images]
        })

    return jsonify(result)

@app.route('/my-diagnostic-reports/<int:report_id>', methods=['GET'])
@jwt_required()
def get_report_details(report_id):
    claims = get_jwt()
    user_id = get_jwt_identity()

    # Ensure the user is a patient
    if claims.get('role') not in ['patient', 'doctor', 'medical_staff']:
        return jsonify({'message': 'Unauthorized'}), 403

    # Fetch the diagnostic report for the patient
    if claims.get('role') == 'patient':
        report = DiagnosticReport.query.filter_by(id=report_id, patient_id=user_id).first()
    else :
        report = DiagnosticReport.query.filter_by(id=report_id).first()

    if not report:
        return jsonify({'message': 'Report not found'}), 404

    # Fetch associated images
    images = DiagnosticImage.query.filter_by(report_id=report_id).all()
    image_data = [{'id': img.id, 'filename': img.filename} for img in images]
    updated_by_user = User.query.get(report.updated_by) if report.updated_by else None

    # Construct response
    response = {
        'report': {
            'id': report.id,
            'type': report.type,
            'description': report.description,
            'diagnosis': report.diagnosis,
            'comment': report.comment,
            'updated_by': updated_by_user.email if updated_by_user else None,
            'updated_at': report.updated_at,
            'created_at': report.created_at,
        },
        'images': image_data,
    }

    return jsonify(response), 200


@app.route('/diagnostic-reports/<int:report_id>/add-comment', methods=['POST'])
@jwt_required()
def add_report_comment(report_id):
    claims = get_jwt()
    user_id = get_jwt_identity()

    if claims.get('role') != 'doctor':
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.json
    diagnosis = data.get('diagnosis')
    comment = data.get('comment')

    report = DiagnosticReport.query.get_or_404(report_id)

    report.diagnosis = diagnosis
    report.comment = comment
    report.updated_by = user_id
    report.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({'message': 'Comment added successfully'}), 200

@app.route('/audit-logs', methods=['GET'])
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


@app.route('/reports/search', methods=['GET'])
@jwt_required()
def search_reports():
    claims = get_jwt()
    if claims.get('role') != 'finance_staff':
        return jsonify({'message': 'Unauthorized'}), 403

    report_type = request.args.get('type')
    patient_email = request.args.get('patient_email')

    query = DiagnosticReport.query.outerjoin(Invoice, DiagnosticReport.id == Invoice.report_id)
    query = query.filter(Invoice.id.is_(None))  # Exclude reports with invoices

    if report_type:
        query = query.filter(DiagnosticReport.type == report_type)
    if patient_email:
        patient = User.query.filter_by(email=patient_email, role='patient').first()
        if not patient:
            return jsonify({'message': 'Patient not found'}), 404
        query = query.filter(DiagnosticReport.patient_id == patient.id)

    reports = query.all()
    return jsonify([
        {
            'id': report.id,
            'type': report.type,
            'description': report.description,
            'created_at': report.created_at,
        }
        for report in reports
    ])

@app.route('/invoices', methods=['POST'])
@jwt_required()
def create_invoice():
    claims = get_jwt()
    if claims.get('role') != 'finance_staff':
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.json
    report_id = data.get('report_id')
    cost = data.get('cost')

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

    return jsonify({'message': 'Invoice created successfully', 'invoice_id': invoice.id}), 201


@app.route('/invoices/filter', methods=['GET'])
@jwt_required()
def get_invoices():
    claims = get_jwt()
    if claims.get('role') != 'finance_staff':
        return jsonify({'message': 'Unauthorized'}), 403

    status = request.args.get('status')  # "Paid" or "Unpaid"

    query = Invoice.query
    if status:
        query = query.filter(Invoice.status == status)

    invoices = query.all()
    return jsonify([
        {
            'id': invoice.id,
            'report_id': invoice.report_id,
            'patient_id': invoice.patient_id,
            'cost': invoice.cost,
            'status': invoice.status,
            'generated_by': invoice.generated_by,
            'created_at': invoice.created_at,
        }
        for invoice in invoices
    ])


@app.route('/invoices/<int:invoice_id>/pay', methods=['PATCH'])
@jwt_required()
def mark_invoice_paid(invoice_id):
    claims = get_jwt()
    if claims.get('role') != 'finance_staff':
        return jsonify({'message': 'Unauthorized'}), 403

    invoice = Invoice.query.get_or_404(invoice_id)
    if invoice.status == "Paid":
        return jsonify({'message': 'Invoice is already marked as paid'}), 400

    invoice.status = "Paid"
    db.session.commit()

    return jsonify({'message': 'Invoice marked as paid successfully'}), 200


@app.route('/patients/<int:patient_id>/total-cost', methods=['GET'])
@jwt_required()
def patient_total_cost(patient_id):
    claims = get_jwt()
    if claims.get('role') != 'finance_staff':
        return jsonify({'message': 'Unauthorized'}), 403

    invoices = Invoice.query.filter_by(patient_id=patient_id, status="Paid").all()
    total_cost = sum(invoice.cost for invoice in invoices)

    return jsonify({'patient_id': patient_id, 'total_cost': total_cost})


if __name__ == '__main__':
    app.run(debug=True)
