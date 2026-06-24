"""
AI Disaster Detection System - Backend Server
File: backend/app.py
Description: Main Entry point for the Python Flask API, configuring endpoints, CORS, and loading blueprints.
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS

# Import blueprints/routes
from routes.prediction_routes import prediction_bp
from routes.alert_routes import alert_bp

def create_app():
    # Initialize Flask app
    app = Flask(__name__, static_folder="../frontend", static_url_path="")
    
    # Enable Cross-Origin Resource Sharing (CORS)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Configure upload configurations
    UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads", "user_uploaded_images")
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Limit files to 16MB
    
    # Register blueprints
    app.register_blueprint(prediction_bp, url_prefix="/api")
    app.register_blueprint(alert_bp, url_prefix="/api")
    
    # Core Health-check route
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "healthy",
            "system": "Aegis AI Disaster Detection Core",
            "model_engine": "TensorFlow/Keras",
            "active_protocols": ["Wildfire", "Flood", "Earthquake", "Cyclone", "Landslide"]
        }), 200

    # Catch-all to serve index.html for frontend assets
    @app.route("/", methods=["GET"])
    def index():
        return app.send_static_file("index.html")

    # Error Handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"error": "Resource not found on Aegis nodes", "code": 404}), 404

    @app.errorhandler(500)
    def internal_server_error(error):
        return jsonify({"error": "Internal processor fault during evaluation", "code": 500}), 500

    return app

if __name__ == "__main__":
    app = create_app()
    # Read port from environment or default to standard 5000 for Python Flask apps
    port = int(os.environ.get("FLASK_PORT", 5000))
    print(f"============================================================")
    print(f"AEGIS DISASTER DETECTION UNIT: ACTIVE")
    print(f"Flask engine running on http://127.0.0.1:{port}")
    print(f"Press CTRL+C to terminate connection")
    print(f"============================================================")
    app.run(host="0.0.0.0", port=port, debug=True)
