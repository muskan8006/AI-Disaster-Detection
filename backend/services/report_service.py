"""
AI Disaster Detection System - Core Services
File: backend/services/report_service.py
Description: Generates official situation reports (SITREPs) based on disaster records.
"""

import time
import uuid

class ReportCompiler:
    def __init__(self):
        # In-memory history of compiled reports
        self.reports_database = [
            {
                "id": "rep-7501",
                "timestamp": float(time.time() - 34 * 3600),
                "title": "SITREP_WILDFIRE_CANYON_RIDGE",
                "disaster_type": "wildfire",
                "severity": "HIGH",
                "status": "Approved",
                "content": "OFFICIAL INCIDENT SITUATION REPORT:\nTriggered wildfire signal. Canyon Ridge Woodland sector. Primary retardants deployed."
            }
        ]

    def compile_sitrep(self, disaster_id, custom_title=None):
        """
        Compiles structural text-based formal SITREPs based on predictions metadata.
        """
        unique_id = str(uuid.uuid4())[:6]
        title = custom_title or f"SITREP_INCIDENT_{disaster_id.upper()}"
        
        # We would normally query prediction service history, mock a beautifully formatted text report
        report_text = f"""
==============================================================
STATE CIVIL PROTECTION SITUATION REPORT: REF rep-{unique_id}
==============================================================
Incident Associated Node: {disaster_id}
Status: FIELD SYSTEM ACTIVE
--------------------------------------------------------------

1. INCIDENT CHARACTERIZATION
- Event Type: HAZARD REPORTED
- Threat Severity Classification: HIGH / EXTREME
- Warning Sirens Status: Local Siren Array Signal Dispatched

2. FIELD OBSERVATIONS & IMPLICATION
- Thermal visual signatures corroborate active environmental anomalies.
- Localized roadway access corridors blocked by active hazard debris.
- Air/Atmospheric toxicity markers checked and validated.

3. FIRST RESPONDER DIRECTIVES
- Establish clear 2km perimeter zones around incident epicenter.
- Initiate localized residential cell phone SMS evacuation alerts.
- Coordinate water transport and chemical flame containment vehicles.

==============================================================
END REPORT - CLASSIFIED: LOCAL AUTHORITIES EMERGENCY NETWORK
==============================================================
"""

        new_report = {
            "id": f"rep-{unique_id}",
            "timestamp": float(time.time()),
            "title": title,
            "disaster_type": "disaster_hazard",
            "severity": "HIGH",
            "status": "Approved",
            "content": report_text.strip()
        }
        
        self.reports_database.insert(0, new_report)
        return new_report

    def get_reports(self):
        return self.reports_database
