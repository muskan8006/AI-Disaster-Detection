"""
AI Disaster Detection System - Core Services
File: backend/services/alert_service.py
Description: Manages and handles broadcast operations to multiple emergency notifications channels.
"""

import time

class AlertSystem:
    def __init__(self):
        # In-memory history of dispatched alerts
        self.dispatched_alerts = [
            {
                "id": "alt-801",
                "timestamp": float(time.time() - 36 * 3600),
                "disaster_id": "pred-seed01",
                "alert_type": "SMS",
                "disaster_type": "wildfire",
                "recipient": "Zone B Woodland Residents",
                "status": "Delivered",
                "message": "EMERGENCY: Rapidly moving wildfire detected in nearby Canyon Ridge. Evacuation of Woodland Sector advised immediately."
            },
            {
                "id": "alt-802",
                "timestamp": float(time.time() - 20 * 3600),
                "disaster_id": "pred-seed02",
                "alert_type": "Siren Network",
                "disaster_type": "flood",
                "recipient": "Delta Basin Siren Arrays 1-4",
                "status": "Delivered",
                "message": "Siren activated: Level 4 flood warning. Inundation of lower floors underway. Seek elevated structures."
            }
        ]

    def dispatch_broadcast(self, alert_type, recipient, message, disaster_id=None):
        """
        Dispatches emergency alert payload to specified communication networks (SMS, Email, sirens).
        """
        import uuid
        
        unique_id = str(uuid.uuid4())[:6]
        
        # Structure the dispatched record
        dispatch_record = {
            "id": f"alt-{unique_id}",
            "timestamp": float(time.time()),
            "disaster_id": disaster_id or "manual-trigger",
            "alert_type": alert_type,
            "disaster_type": "manual" if not disaster_id else "linked",
            "recipient": recipient or "Emergency Dispatch Channel",
            "status": "Delivered", # Mocking active successful network deployment
            "message": message
        }
        
        # Append to localized alert list
        self.dispatched_alerts.insert(0, dispatch_record)
        return dispatch_record

    def get_dispatched_history(self):
        return self.dispatched_alerts
