"""
AI Disaster Detection System - Flask routes
File: backend/routes/prediction_routes.py
Description: Flask endpoints for handling image upload, triggers disaster classifications, and pulls history.
"""

import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename

# Import Services & Utils
from services.prediction_service import DisasterClassifier
from utils.image_processing import validate_image_file

prediction_bp = Blueprint("prediction", __name__)

# Allowed extension files helper
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Instantiate core classifier service
classifier = DisasterClassifier()

@prediction_bp.route("/predict", methods=["POST"])
def predict_disaster():
    """
    Endpoint: POST /api/predict
    Payload: Multipart Form-data containing 'image' file
    """
    # 1. Validate file presence
    if 'image' not in request.files:
        return jsonify({"error": "No image payload detected in request."}), 400
        
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({"error": "Empty file name submitted."}), 400
        
    if not file or not allowed_file(file.filename):
        return jsonify({"error": "Unsupported image format. Upload PNG, JPEG or WEBP."}), 400

    try:
        # 2. Secure file saving
        filename = secure_filename(file.filename)
        unique_id = str(uuid.uuid4())[:8]
        saved_filename = f"{unique_id}_{filename}"
        
        upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], saved_filename)
        file.save(upload_path)
        
        # 3. Validate image dimensions and format integrity
        if not validate_image_file(upload_path):
            os.remove(upload_path)
            return jsonify({"error": "Image file failed raster dimensions sanity checks."}), 400
            
        # 4. Trigger prediction model classifier service
        classification_result = classifier.evaluate_image(upload_path)
        
        # 5. Compile full response schema
        response = {
            "id": f"pred-{unique_id}",
            "filename": saved_filename,
            "prediction": classification_result["disaster_type"],
            "confidence": float(classification_result["confidence"]),
            "severity_level": classification_result["severity"],
            "description": classification_result["description"],
            "environmental_impacts": classification_result["key_impacts"],
            "emergency_protocols": classification_result["recommended_actions"],
            "coordinates": classification_result["coordinates"],
            "estimated_affected_radius": classification_result["affected_area"]
        }
        
        # Save records in classifier memory history
        classifier.append_history(response)
        
        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": f"Evaluation process failed: {str(e)}"}), 500


@prediction_bp.route("/predictions/history", methods=["GET"])
def get_prediction_history():
    """
    Endpoint: GET /api/predictions/history
    """
    history = classifier.get_history()
    return jsonify(history), 200
