"""
AI Disaster Detection System - Flask routes
File: backend/routes/alert_routes.py
Description: Flask endpoints for managing alerts, trigger manual overrides, and compile situation reports.
"""

from flask import Blueprint, request, jsonify

# Import Services
from services.alert_service import AlertSystem
from services.report_service import ReportCompiler

alert_bp = Blueprint("alerts", __name__)

# Initialize Core Services
alert_system = AlertSystem()
report_compiler = ReportCompiler()

@alert_bp.route("/alerts/broadcast", methods=["POST"])
def broadcast_emergency_alert():
    """
    Endpoint: POST /api/alerts/broadcast
    Payload: JSON with { disaster_id, alert_type, recipient, message }
    """
    data = request.get_json() or {}
    
    alert_type = data.get("alert_type")
    recipient = data.get("recipient")
    message = data.get("message")
    disaster_id = data.get("disaster_id")
    
    if not alert_type or not message:
        return jsonify({"error": "Missing alert_type or payload message in broadcast request."}), 400
        
    try:
        # Dispatch alert via service
        dispatch_record = alert_system.dispatch_broadcast(
            alert_type=alert_type,
            recipient=recipient,
            message=message,
            disaster_id=disaster_id
        )
        return jsonify(dispatch_record), 200
    except Exception as e:
        return jsonify({"error": f"Failed to dispatch broadcast: {str(e)}"}), 500


@alert_bp.route("/alerts/history", methods=["GET"])
def get_alerts_history():
    """
    Endpoint: GET /api/alerts/history
    """
    return jsonify(alert_system.get_dispatched_history()), 200


@alert_bp.route("/reports/compile", methods=["POST"])
def compile_situation_report():
    """
    Endpoint: POST /api/reports/compile
    Payload: JSON with { disaster_id, title }
    """
    data = request.get_json() or {}
    disaster_id = data.get("disaster_id")
    title = data.get("title")
    
    if not disaster_id:
        return jsonify({"error": "Missing disaster_id link to compile situation report."}), 400
        
    try:
        # Generate official report via service
        report_record = report_compiler.compile_sitrep(disaster_id=disaster_id, custom_title=title)
        return jsonify(report_record), 200
    except ValueError as val_err:
        return jsonify({"error": str(val_err)}), 404
    except Exception as e:
        return jsonify({"error": f"Failed to compile report: {str(e)}"}), 500


@alert_bp.route("/reports/history", methods=["GET"])
def get_reports_history():
    """
    Endpoint: GET /api/reports/history
    """
    return jsonify(report_compiler.get_reports()), 200
