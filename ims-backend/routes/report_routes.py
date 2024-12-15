from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from models.diagnostic_report import DiagnosticReport
from models.diagnostic_image import DiagnosticImage
from models.invoice import Invoice
from models.user import User
from extensions import db
from utils.encryption_utils import encrypt_data, decrypt_data
from utils.audit_utils import log_audit_action
from werkzeug.utils import secure_filename
from datetime import datetime
from sqlalchemy import desc

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

report_routes = Blueprint("report_routes", __name__)

# Create Diagnostic reports for a patient
@report_routes.route('/diagnostic-reports', methods=['POST'])
@jwt_required()
def create_diagnostic_report():
    claims = get_jwt()

    if claims.get('role') not in ['medical_staff', 'doctor']:
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

@report_routes.route('/diagnostic-reports/<int:report_id>/images', methods=['POST'])
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

    # Log the action
    log_audit_action(
        user_id=get_jwt_identity(),  # User who performed the action
        action="INSERT",
        table_name="images",
        record_id=report.id,
        details={"files":uploaded_files}
    )

    return jsonify({'message': 'Images uploaded successfully', 'uploaded_files': uploaded_files}), 201

@report_routes.route('/diagnostic-reports/images/<int:image_id>', methods=['GET'])
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
        return jsonify({'message': 'Unauthorized'}), 403
    if role not in ['patient', 'medical_staff', 'doctor']:
        return jsonify({'message': 'Unauthorized'}), 403
    
    # Log the action
    log_audit_action(
        user_id=get_jwt_identity(),  # User who performed the action
        action="VIEW",
        table_name="images",
        record_id=report.id,
        details={"file":diagnostic_image.filename,"report":diagnostic_image.report_id}
    )

    # Decrypt and return the image
    decrypted_data = decrypt_data(diagnostic_image.data)
    response = make_response(decrypted_data)
    response.headers.set('Content-Type', 'application/octet-stream')
    response.headers.set(
        'Content-Disposition', f'attachment; filename={diagnostic_image.filename}'
    )
    return response


@report_routes.route('/patients/<int:patient_id>/diagnostic-reports', methods=['GET'])
@jwt_required()
def list_diagnostic_reports(patient_id):
    claims = get_jwt()
    if claims.get('role') not in ['medical_staff', 'doctor']:
        return jsonify({'message': 'Unauthorized'}), 403

    reports = DiagnosticReport.query.filter_by(patient_id=patient_id).order_by(desc(DiagnosticReport.created_at)).all()
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

    # Log the action
    log_audit_action(
        user_id=get_jwt_identity(),  # User who performed the action
        action="VIEW",
        table_name="reports",
        record_id=patient_id,
        details={"reports":len(result)}
    )

    return jsonify(result)

@report_routes.route('/my-diagnostic-reports', methods=['GET'])
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
    
    # Log the action
    log_audit_action(
        user_id=get_jwt_identity(),  # User who performed the action
        action="VIEW",
        table_name="reports",
        record_id=patient_id,
        details={"reports":len(result)}
    )

    return jsonify(result)

@report_routes.route('/my-diagnostic-reports/<int:report_id>', methods=['GET'])
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

    # Log the action
    log_audit_action(
        user_id=get_jwt_identity(),  # User who performed the action
        action="VIEW",
        table_name="reports",
        record_id=report.id,
        details={"patient":user_id,"report":report_id}
    )

    return jsonify(response), 200


@report_routes.route('/diagnostic-reports/<int:report_id>/add-comment', methods=['POST'])
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

    # Log the action
    log_audit_action(
        user_id=get_jwt_identity(),  # User who performed the action
        action="ADD-COMMENT",
        table_name="reports",
        record_id=report.id,
        details={"comment":comment,"diagnosis":diagnosis}
    )


    return jsonify({'message': 'Comment added successfully'}), 200

@report_routes.route('/search', methods=['GET'])
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

    # Log the action
    log_audit_action(
        user_id=get_jwt_identity(),  # User who performed the action
        action="SEARCH",
        table_name="reports",
        record_id=0,
        details={"type":report_type,"email":patient_email}
    )


    return jsonify([
        {
            'id': report.id,
            'type': report.type,
            'description': report.description,
            'created_at': report.created_at,
        }
        for report in reports
    ])