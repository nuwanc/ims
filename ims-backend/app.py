from flask import Flask
from flask_cors import CORS
from extensions import db, jwt, migrate
from routes.auth_routes import auth_routes
from routes.user_routes import user_routes
from routes.report_routes import report_routes
from routes.invoice_routes import invoice_routes
from routes.audit_routes import audit_routes
from routes.stats_routes import stats_routes
from config import Config

# Define how user identity is serialized into the JWT
@jwt.user_identity_loader
def user_identity_lookup(user):
    return str(user.id)

# Define how additional claims are added to the JWT
@jwt.additional_claims_loader
def add_claims_to_access_token(user):
    return {'role': user.role}

def create_app():
    app = Flask(__name__)
     # Configure CORS for the app with specific headers and methods
    CORS(app, resources={r"/*": {"origins": "*"}}, methods=["GET", "POST", "OPTIONS", "DELETE", "PATCH"], supports_credentials=True)
    app.config.from_object(Config)

    # Initialize Extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)


    # Register Blueprints
    app.register_blueprint(auth_routes, url_prefix="/auth")
    app.register_blueprint(user_routes, url_prefix="/user")
    app.register_blueprint(report_routes, url_prefix="/report")
    app.register_blueprint(invoice_routes, url_prefix="/invoice")
    app.register_blueprint(audit_routes, url_prefix="/audit")
    app.register_blueprint(stats_routes,url_prefix="/stats")

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
