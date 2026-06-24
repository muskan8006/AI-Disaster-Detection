import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON body parser with limit for base64 images
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Initialize Gemini SDK with User-Agent header for telemetry
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini AI client successfully initialized on backend.");
  } else {
    console.warn("GEMINI_API_KEY not found in environment. Running with simulation mode.");
  }
} catch (err) {
  console.error("Failed to initialize Gemini AI client:", err);
}

// Seed Mock Data for Disaster Analytics & Dashboard
interface PredictionRecord {
  id: string;
  timestamp: string;
  disasterType: string;
  confidence: number;
  severity: "low" | "medium" | "high" | "extreme";
  summary: string;
  keyImpacts: string[];
  recommendedActions: string[];
  affectedAreaEstimate: string;
  locationName: string;
  coordinates: { lat: number; lng: number };
  imageUrl?: string;
  alertBroadcasted: boolean;
}

interface AlertRecord {
  id: string;
  timestamp: string;
  disasterId?: string;
  type: "SMS" | "Email" | "Radio Broadcast" | "Siren Network";
  disasterType: string;
  recipient: string;
  status: "Sent" | "Delivered" | "Failed";
  message: string;
}

interface ReportRecord {
  id: string;
  timestamp: string;
  title: string;
  disasterType: string;
  severity: string;
  status: "Draft" | "Approved" | "Archived";
  content: string;
}

const predictionsStore: PredictionRecord[] = [
  {
    id: "pred-101",
    timestamp: new Date(Date.now() - 36 * 3600000).toISOString(), // 36 hours ago
    disasterType: "wildfire",
    confidence: 0.94,
    severity: "high",
    summary: "Large-scale forest fire moving rapidly with wind gusts. Immediate evacuation warning issued for peripheral woodland settlements.",
    keyImpacts: ["500+ hectares scorched", "Structural hazard to local cabins", "Thick canopy smoke spreading downwind"],
    recommendedActions: ["Establish a 3km exclusion perimeter", "Deploy aerial retardant drops", "Instruct residential units to seal HVAC systems and evacuate"],
    affectedAreaEstimate: "550 Hectares",
    locationName: "Canyon Ridge Pine Valley",
    coordinates: { lat: 34.0522, lng: -118.2437 },
    alertBroadcasted: true,
  },
  {
    id: "pred-102",
    timestamp: new Date(Date.now() - 20 * 3600000).toISOString(), // 20 hours ago
    disasterType: "flood",
    confidence: 0.89,
    severity: "extreme",
    summary: "Severe river bank rupture following heavy monsoon depression. Water levels rising at 15cm/hr inside urban industrial zones.",
    keyImpacts: ["Submersion of primary access roadways", "Power substation flooding", "Sewer line overflow contamination risk"],
    recommendedActions: ["Shut down main substation breakers", "Activate community sandbag barriers", "Deploy rubber boat extraction squads"],
    affectedAreaEstimate: "12 Square Kilometers",
    locationName: "Lowland Delta industrial Basin",
    coordinates: { lat: 29.7604, lng: -95.3698 },
    alertBroadcasted: true,
  },
  {
    id: "pred-103",
    timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), // 8 hours ago
    disasterType: "landslide",
    confidence: 0.85,
    severity: "medium",
    summary: "Saturated hillside creep causing roadway fracture and partial mud blocking of highway corridor.",
    keyImpacts: ["Single arterial road blocked", "Power grid pole leaning", "Structural stress on retaining walls"],
    recommendedActions: ["Close down Highway 4 Northbound", "Deploy geotechnical stability sensors", "Initiate mechanical soil clearing"],
    affectedAreaEstimate: "0.5 Hectares",
    locationName: "East Cliff Coastal Pass",
    coordinates: { lat: 37.7749, lng: -122.4194 },
    alertBroadcasted: false,
  }
];

const alertsStore: AlertRecord[] = [
  {
    id: "alt-001",
    timestamp: new Date(Date.now() - 35.8 * 3600000).toISOString(),
    disasterId: "pred-101",
    type: "SMS",
    disasterType: "wildfire",
    recipient: "Area Code 208 Emergency Broadcast",
    status: "Delivered",
    message: "EMERGENCY: Rapidly moving wildfire detected in Canyon Ridge Pine Valley. Evacuation is advised for zones A & B immediately."
  },
  {
    id: "alt-002",
    timestamp: new Date(Date.now() - 35.7 * 3600000).toISOString(),
    type: "Email",
    disasterType: "wildfire",
    recipient: "disaster-response-hq@state.gov",
    status: "Sent",
    message: "Disaster Detection Alert: AI Model predicted a high-severity WILDFIRE (94% confidence) at Canyon Ridge Pine Valley. Detailed visual intelligence attached."
  },
  {
    id: "alt-003",
    timestamp: new Date(Date.now() - 19.8 * 3600000).toISOString(),
    disasterId: "pred-102",
    type: "Siren Network",
    disasterType: "flood",
    recipient: "Delta Basin Siren Arrays 1-4",
    status: "Delivered",
    message: "Siren activated: Level 4 warning. Lowland Delta inundation in progress. Ascend to upper stories or pre-planned escape levels."
  }
];

const reportsStore: ReportRecord[] = [
  {
    id: "rep-001",
    timestamp: new Date(Date.now() - 35 * 3600000).toISOString(),
    title: "SITREP-2026-06-24_WILDFIRE_01",
    disasterType: "wildfire",
    severity: "High",
    status: "Approved",
    content: "EXECUTIVE SUMMARY: On June 24, AI Disaster Detection identified active wildfire fronting Canyon Ridge Pine Valley. Heat signals confirm aggressive expansion. Initial aerial deployment has commenced. Evacuation orders are currently 85% completed. Smoke dispersion poses secondary air index warnings to neighbor towns."
  },
  {
    id: "rep-002",
    timestamp: new Date(Date.now() - 19 * 3600000).toISOString(),
    title: "SITREP-2026-0 mon_FLOOD_02",
    disasterType: "flood",
    severity: "Extreme",
    status: "Approved",
    content: "EXECUTIVE SUMMARY: Flood monitoring sensors and image feed analysis in the Lowland Delta industrial zone triggered critical extreme severity warnings. Hydraulic backups have completely closed standard roads. Safe evacuation routes are currently limited to elevated train rail margins and maritime rescue. State water safety task force is deployed."
  }
];

// 1. API: Predict Disaster from Image
app.post("/api/predict", async (req, res) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 data in request body." });
    }

    // Clean base64 string
    const base64Clean = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const mimeType = imageBase64.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";

    let resultJsonStr = "";
    let disasterType = "normal";
    let confidence = 0.95;
    let severity: "low" | "medium" | "high" | "extreme" = "low";
    let summary = "";
    let keyImpacts: string[] = [];
    let recommendedActions: string[] = [];
    let affectedAreaEstimate = "Unknown";
    let locationName = "Identified Location";
    let coordinates = { lat: 37.7749, lng: -122.4194 };

    if (ai) {
      console.log("Calling Gemini API for disaster detection...");
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [
            {
              inlineData: {
                data: base64Clean,
                mimeType: mimeType,
              },
            },
            {
              text: `Analyze this image for signs of natural disasters or environmental hazards.
Determine if the image represents one of these categories:
- wildfire
- flood
- earthquake
- cyclone
- landslide
- normal (no disaster)

You must output your response strictly as a JSON object matching this schema:
{
  "disasterType": "wildfire" | "flood" | "earthquake" | "cyclone" | "landslide" | "normal",
  "confidence": number between 0.0 and 1.0 representing the classification certainty,
  "severity": "low" | "medium" | "high" | "extreme",
  "summary": "a descriptive 2-3 sentence overview of what is seen, detailing damage levels or safety concerns",
  "keyImpacts": ["list of 3 key observable impacts of this disaster"],
  "recommendedActions": ["list of 3 immediately critical actions for first responders and citizens"],
  "affectedAreaEstimate": "approximate size or descriptive scale of disaster, e.g. '100 Hectares' or 'Local street block'",
  "locationName": "Inferred geographical location description based on visual clues, architecture, landscape, or generic description",
  "coordinates": { "lat": number, "lng": number }
}
Return only the raw JSON code without any Markdown formatting wrappers like \`\`\`json. Ensure it is valid JSON.`,
            },
          ],
          config: {
            responseMimeType: "application/json",
          },
        });

        resultJsonStr = response.text || "{}";
        console.log("Raw Gemini API response:", resultJsonStr);

        // Parse JSON
        const parsed = JSON.parse(resultJsonStr);
        disasterType = parsed.disasterType || "normal";
        confidence = typeof parsed.confidence === "number" ? parsed.confidence : 0.90;
        severity = parsed.severity || "low";
        summary = parsed.summary || "No specific disaster features detected in the provided image.";
        keyImpacts = parsed.keyImpacts || ["No visual impacts detected"];
        recommendedActions = parsed.recommendedActions || ["Keep monitoring national weather updates"];
        affectedAreaEstimate = parsed.affectedAreaEstimate || "None";
        locationName = parsed.locationName || "Visual Area";
        coordinates = parsed.coordinates || { lat: 37.7749, lng: -122.4194 };

      } catch (geminiError) {
        console.error("Gemini API execution error, falling back to simulated analysis:", geminiError);
        // Fallback simulation based on filename cues
        const fn = (filename || "").toLowerCase();
        if (fn.includes("fire") || fn.includes("smoke") || fn.includes("burn") || fn.includes("forest")) {
          disasterType = "wildfire";
          confidence = 0.88;
          severity = "high";
          summary = "Active forest fire with high-temperature canopy expansion detected via filename-inferred characteristics.";
          keyImpacts = ["Thick smoke plume", "Imminent thermal hazard to vegetation", "Rapid propagation"];
          recommendedActions = ["Alert park rangers", "Prepare aerial water bombers", "Check dry weather indices"];
          affectedAreaEstimate = "150 Hectares";
          locationName = "Detected Fire Sector (Fallback)";
          coordinates = { lat: 34.0522, lng: -118.2437 };
        } else if (fn.includes("flood") || fn.includes("water") || fn.includes("rain") || fn.includes("river")) {
          disasterType = "flood";
          confidence = 0.85;
          severity = "high";
          summary = "Heavy water overflowing onto paved urban corridors detected via fallback evaluation.";
          keyImpacts = ["Water logging", "Vehicle transit halts", "Electrical grid dangers"];
          recommendedActions = ["Activate flood pumps", "Issue high-water transit advice", "Seal sandbag barriers"];
          affectedAreaEstimate = "5 Square Kilometers";
          locationName = "Inundated Basin (Fallback)";
          coordinates = { lat: 29.7604, lng: -95.3698 };
        } else if (fn.includes("quake") || fn.includes("rubble") || fn.includes("crack") || fn.includes("earthquake")) {
          disasterType = "earthquake";
          confidence = 0.82;
          severity = "extreme";
          summary = "Structural failure, cracked masonry, and rubble wreckage indicating violent ground rupture.";
          keyImpacts = ["Debris blockages", "Building structural compromise", "Utility conduit breaks"];
          recommendedActions = ["Deploy canine rescue units", "Isolate gas pipelines", "Establish emergency tents"];
          affectedAreaEstimate = "Entire city district";
          locationName = "Seismic Incident Area (Fallback)";
          coordinates = { lat: 35.6762, lng: 139.6503 };
        } else if (fn.includes("cyclone") || fn.includes("hurricane") || fn.includes("wind") || fn.includes("storm")) {
          disasterType = "cyclone";
          confidence = 0.91;
          severity = "extreme";
          summary = "Destructive high-wind circular weather system causing debris scatter and coastal storm surge.";
          keyImpacts = ["Uprooted power infrastructure", "Roofing failure", "Extreme coastal surge"];
          recommendedActions = ["Enforce complete indoor sheltering", "Deploy marine rescue standby", "Activate cell grid reserves"];
          affectedAreaEstimate = "50-mile diameter corridor";
          locationName = "Coastal Cyclone Corridor (Fallback)";
          coordinates = { lat: 25.7617, lng: -80.1918 };
        } else if (fn.includes("slide") || fn.includes("mud") || fn.includes("landslide") || fn.includes("rock")) {
          disasterType = "landslide";
          confidence = 0.87;
          severity = "medium";
          summary = "Saturated soil mass displacement moving downslope across critical transit links.";
          keyImpacts = ["Corridor blockades", "Silt runoffs into rivers", "Retaining wall collapses"];
          recommendedActions = ["Deploy structural barriers", "Stop heavy trucks", "Begin earthmovers mobilization"];
          affectedAreaEstimate = "2 Hectares";
          locationName = "High-Gradient Slopeway (Fallback)";
          coordinates = { lat: 37.7749, lng: -122.4194 };
        } else {
          disasterType = "normal";
          confidence = 0.94;
          severity = "low";
          summary = "Visual check completed. No active signatures of floods, wildfires, storms, or landslides identified.";
          keyImpacts = ["No severe structural dangers", "Ambient atmosphere", "Standard utility flow"];
          recommendedActions = ["Standard diagnostic checks", "Routine weather telemetry logging", "No alert required"];
          affectedAreaEstimate = "N/A";
          locationName = "Clear View Sector (Fallback)";
          coordinates = { lat: 40.7128, lng: -74.0060 };
        }
      }
    } else {
      // Simulation mode because API key is absent
      console.log("Running in simulation mode (no API key configured)...");
      const fn = (filename || "").toLowerCase();
      if (fn.includes("fire") || fn.includes("smoke") || fn.includes("burn") || fn.includes("forest")) {
        disasterType = "wildfire";
        confidence = 0.92;
        severity = "high";
        summary = "Simulated detection: active forest canopy fire pushing intense thermal columns and heavy smoke drifts.";
        keyImpacts = ["Extreme thermal envelope", "Ash fallout over residential margins", "Secondary route blockage"];
        recommendedActions = ["Initiate emergency response alert", "Mobilize chemical containment units", "Direct traffic clear of valley"];
        affectedAreaEstimate = "200 Hectares";
        locationName = "Simulated Foothills Zone";
        coordinates = { lat: 34.0522, lng: -118.2437 };
      } else if (fn.includes("flood") || fn.includes("water") || fn.includes("rain") || fn.includes("river")) {
        disasterType = "flood";
        confidence = 0.87;
        severity = "high";
        summary = "Simulated detection: overflowing storm drainage lines causing inundation across major regional transit lanes.";
        keyImpacts = ["Structural baseline erosion", "Submersion of low-profile motorcars", "Drinking supply grid hazard"];
        recommendedActions = ["Dispatch watercraft squads", "Instruct communities to seek higher grounds", "Deploy emergency levees"];
        affectedAreaEstimate = "8 Square Kilometers";
        locationName = "Simulated Delta Flats";
        coordinates = { lat: 29.7604, lng: -95.3698 };
      } else {
        // Random choose between disaster or normal
        const disasters: Array<"wildfire" | "flood" | "earthquake" | "cyclone" | "landslide" | "normal"> = [
          "wildfire",
          "flood",
          "earthquake",
          "cyclone",
          "landslide",
          "normal",
        ];
        const randomIdx = Math.floor(Math.random() * disasters.length);
        disasterType = disasters[randomIdx];

        if (disasterType === "wildfire") {
          confidence = 0.89;
          severity = "high";
          summary = "Active flame lines and deep thermal signatures identified in visual spectrum scan.";
          keyImpacts = ["Rapid burn vector", "Smoke dispersion across nearby corridors", "Canopy structural degradation"];
          recommendedActions = ["Issue localized warning sirens", "Isolate fuel depots", "Prepare backup water reserves"];
          affectedAreaEstimate = "85 Hectares";
          locationName = "Simulated National Forest sector";
          coordinates = { lat: 44.0682, lng: -121.3153 };
        } else if (disasterType === "flood") {
          confidence = 0.86;
          severity = "medium";
          summary = "Widespread surface level water accumulation breaching temporary earthen dykes.";
          keyImpacts = ["Roadways impassable", "Agricultural field oversaturation", "Basement flooding hazards"];
          recommendedActions = ["Set up temporary sand barriers", "Deploy localized pumping assets", "Reroute commercial haulers"];
          affectedAreaEstimate = "3 Square Kilometers";
          locationName = "Simulated Lowland Floodplain";
          coordinates = { lat: 41.8781, lng: -87.6298 };
        } else if (disasterType === "earthquake") {
          confidence = 0.93;
          severity = "extreme";
          summary = "Significant load-bearing failure, concrete rubble heaps, and structural collapses observed.";
          keyImpacts = ["Partial/Total building collapse", "Roadway buckling and severe cracks", "Potential gas line breaches"];
          recommendedActions = ["Begin immediate search & rescue", "Shut off municipal gas valves", "Establish field trauma centers"];
          affectedAreaEstimate = "Urban Center Radius 2km";
          locationName = "Simulated Faultline City Zone";
          coordinates = { lat: 34.0522, lng: -118.2437 };
        } else if (disasterType === "cyclone") {
          confidence = 0.95;
          severity = "extreme";
          summary = "Violent wind shear, swirling clouds, structural roof shearing, and flying debris hazard.";
          keyImpacts = ["Total communications downing", "Extensive tree and structural damage", "Tidal surge in coastal areas"];
          recommendedActions = ["Enforce complete emergency bunker lockdown", "Stand by deep-water rescue units", "Coordinate post-storm relief supplies"];
          affectedAreaEstimate = "Regional corridor (wide scale)";
          locationName = "Simulated Coastal Windward District";
          coordinates = { lat: 25.7617, lng: -80.1918 };
        } else if (disasterType === "landslide") {
          confidence = 0.88;
          severity = "high";
          summary = "Massive cliffside collapse with gravel, mud and debris completely smothering transit routes.";
          keyImpacts = ["Complete railway/highway blockage", "Destruction of cliffside utility cables", "Siltation of mountain water basins"];
          recommendedActions = ["Establish immediate geo-hazards safety cordon", "Mobilize excavators", "Reroute high-altitude energy distribution"];
          affectedAreaEstimate = "4 Hectares";
          locationName = "Simulated Canyon Highpass";
          coordinates = { lat: 47.6062, lng: -122.3321 };
        } else {
          disasterType = "normal";
          confidence = 0.98;
          severity = "low";
          summary = "Normal scene detected. Standard vegetation, terrain, and weather conditions. No anomalies identified.";
          keyImpacts = ["No environmental hazards visible", "Normal atmospheric conditions", "No structural damages"];
          recommendedActions = ["Routine observation logs updated", "Maintain periodic system self-tests", "No prompt response needed"];
          affectedAreaEstimate = "N/A";
          locationName = "Simulated Regular Sector";
          coordinates = { lat: 40.7128, lng: -74.0060 };
        }
      }
    }

    const newRecord: PredictionRecord = {
      id: "pred-" + Math.floor(Math.random() * 9000 + 1000),
      timestamp: new Date().toISOString(),
      disasterType,
      confidence,
      severity,
      summary,
      keyImpacts,
      recommendedActions,
      affectedAreaEstimate,
      locationName,
      coordinates,
      imageUrl: imageBase64,
      alertBroadcasted: false,
    };

    // Store in our memory list
    predictionsStore.unshift(newRecord);

    return res.json(newRecord);
  } catch (error: any) {
    console.error("Error in /api/predict route:", error);
    res.status(500).json({ error: error.message || "An error occurred during disaster classification." });
  }
});

// 2. API: Get Prediction History
app.get("/api/predictions", (req, res) => {
  res.json(predictionsStore);
});

// 3. API: Trigger/Broadcast Alert
app.post("/api/alerts/broadcast", (req, res) => {
  try {
    const { disasterId, type, recipient, message } = req.body;
    if (!type || !message) {
      return res.status(400).json({ error: "Missing type or message in request body." });
    }

    // Find prediction to mark alert as broadcasted
    const disaster = predictionsStore.find((p) => p.id === disasterId);
    if (disaster) {
      disaster.alertBroadcasted = true;
    }

    const newAlert: AlertRecord = {
      id: "alt-" + Math.floor(Math.random() * 9000 + 1000),
      timestamp: new Date().toISOString(),
      disasterId,
      type,
      disasterType: disaster ? disaster.disasterType : "manual",
      recipient: recipient || "Emergency Local Dispatch Network",
      status: "Delivered",
      message,
    };

    alertsStore.unshift(newAlert);
    res.json(newAlert);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. API: Get Alert History
app.get("/api/alerts", (req, res) => {
  res.json(alertsStore);
});

// 5. API: Get Situation Reports
app.get("/api/reports", (req, res) => {
  res.json(reportsStore);
});

// 6. API: Generate Situation Report
app.post("/api/reports/generate", (req, res) => {
  try {
    const { disasterId, title } = req.body;
    const disaster = predictionsStore.find((p) => p.id === disasterId);
    if (!disaster) {
      return res.status(404).json({ error: "Associated disaster prediction not found." });
    }

    const cleanTitle = title || `INCIDENT_REPORT_${disaster.disasterType.toUpperCase()}_${disaster.id}`;

    const reportContent = `
=========================================
OFFICIAL INCIDENT REPORT: ${disaster.disasterType.toUpperCase()} DETECTED
=========================================
Report Reference: REP-${Math.floor(Math.random() * 90000 + 10000)}
Detection Timestamp: ${disaster.timestamp}
Generating Agent: AI Disaster Detection Hub (System v3.5-Active)
-----------------------------------------

1. INCIDENT PROFILE
- Primary Target: ${disaster.disasterType.toUpperCase()} Event
- Visual Signature Certainty: ${(disaster.confidence * 100).toFixed(1)}%
- Severity Grading: ${disaster.severity.toUpperCase()}
- Geographic Inscription: ${disaster.locationName} (LAT: ${disaster.coordinates.lat.toFixed(4)}, LNG: ${disaster.coordinates.lng.toFixed(4)})
- Approximate Hazard Radius: ${disaster.affectedAreaEstimate}

2. THERMAL & VISUAL SYNOPSIS
${disaster.summary}

3. PRIMARY ENVIRONMENT IMPACT CODES
${disaster.keyImpacts.map((imp, idx) => `  [${idx + 1}] ${imp}`).join("\n")}

4. IMMEDIATE FIELD TACTICAL DIRECTIVES
${disaster.recommendedActions.map((act, idx) => `  [#${idx + 1}] ${act}`).join("\n")}

5. TELEMETRY STATUS
- Warning Sirens: ${disaster.severity === "extreme" || disaster.severity === "high" ? "Engaged (Level A)" : "In Standby Mode"}
- First Responder Dispatch Status: Active Communication Channel Established
- System Integrity: Nominal

=========================================
CONFIDENTIALITY DECREE: State Public Safety Telecommunications Core
=========================================
`;

    const newReport: ReportRecord = {
      id: "rep-" + Math.floor(Math.random() * 9000 + 1000),
      timestamp: new Date().toISOString(),
      title: cleanTitle,
      disasterType: disaster.disasterType,
      severity: disaster.severity,
      status: "Approved",
      content: reportContent,
    };

    reportsStore.unshift(newReport);
    res.json(newReport);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. API: Get Aggregate Analytics
app.get("/api/analytics", (req, res) => {
  // Return compiled numbers for our charts
  const disasterTypesCount = {
    wildfire: 0,
    flood: 0,
    earthquake: 0,
    cyclone: 0,
    landslide: 0,
    normal: 0,
  };

  const severityCount = {
    low: 0,
    medium: 0,
    high: 0,
    extreme: 0,
  };

  predictionsStore.forEach((p) => {
    const type = p.disasterType as keyof typeof disasterTypesCount;
    if (disasterTypesCount[type] !== undefined) {
      disasterTypesCount[type]++;
    }
    const sev = p.severity as keyof typeof severityCount;
    if (severityCount[sev] !== undefined) {
      severityCount[sev]++;
    }
  });

  const historicalMonths = [
    { name: "Jan", incidents: 1, alerts: 1 },
    { name: "Feb", incidents: 2, alerts: 2 },
    { name: "Mar", incidents: 4, alerts: 3 },
    { name: "Apr", incidents: 3, alerts: 2 },
    { name: "May", incidents: 8, alerts: 6 },
    { name: "Jun", incidents: predictionsStore.length, alerts: alertsStore.length },
  ];

  res.json({
    disasterDistribution: Object.entries(disasterTypesCount).map(([name, value]) => ({ name, value })),
    severityDistribution: Object.entries(severityCount).map(([name, value]) => ({ name, value })),
    historicalTrends: historicalMonths,
    counters: {
      totalPredictions: predictionsStore.length,
      totalAlerts: alertsStore.length,
      totalReports: reportsStore.length,
      unresolvedSevere: predictionsStore.filter((p) => (p.severity === "high" || p.severity === "extreme") && !p.alertBroadcasted).length,
    }
  });
});

// API: Clear All Telemetry Data
app.post("/api/clear", (req, res) => {
  predictionsStore.length = 0;
  alertsStore.length = 0;
  reportsStore.length = 0;
  res.json({ success: true, message: "Aegis Command Telemetry databases successfully purged." });
});

// 8. API: Tactical Copilot Chat
app.post("/api/copilot", async (req, res) => {
  try {
    const { messages, incidentContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing messages in request body." });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // System instructions for the Tactical Advisor
    const systemPrompt = `You are Aegis Command, a highly advanced tactical crisis management AI assistant.
The user is a state emergency response commander.
Provide professional, brief, actionable, and structured tactical guidance.
Keep responses to 1-3 short paragraphs, formatted nicely with markdown bullet points if appropriate.
Avoid fluff. Use strategic civil-defense and military/tactical tone.
${incidentContext ? `\nActive Incident Context:
- ID: ${incidentContext.id}
- Type: ${incidentContext.disasterType}
- Location: ${incidentContext.locationName}
- Severity: ${incidentContext.severity}
- Summary: ${incidentContext.summary}
- Impacts: ${incidentContext.keyImpacts.join(", ")}
- Recommended Actions: ${incidentContext.recommendedActions.join(", ")}` : "No current active incident selected."}`;

    if (ai) {
      // Map message history to Gemini API expected content structures
      const contents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      // Prepend system prompt to the conversation or frame it as user instruction
      contents.unshift({
        role: "user",
        parts: [{ text: `SYSTEM DIRECTIVE: ${systemPrompt}\n\nAcknowledge this system setup and start standard command advisory responses.` }],
      });
      contents.push({
        role: "model",
        parts: [{ text: "System Directive Registered. Aegis Tactical Command Node is online. How can I assist with tactical dispatch or hazard mitigation?" }],
      });
      contents.push({
        role: "user",
        parts: [{ text: lastUserMessage }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
      });

      const text = response.text || "Tactical response generation failed. System link unstable.";
      return res.json({ text });
    } else {
      // Fallback Simulation Mode
      const lower = lastUserMessage.toLowerCase();
      let responseText = "";

      if (lower.includes("evac") || lower.includes("evacuation") || lower.includes("clear")) {
        responseText = `**Aegis Tactical Advisory [SIMULATED]**:\n\n* **Evacuation Mandate**: Direct all response units to declare a Level 3 civil defense evacuation perimeter.\n* **Corridors**: Enforce unidirectional traffic flows on primary escape routes to prevent gridlock.\n* **Shelters**: Open civilian intake depots at least 5km from the hazard zone coordinates.`;
      } else if (lower.includes("siren") || lower.includes("broadcast") || lower.includes("alarm")) {
        responseText = `**Aegis Tactical Advisory [SIMULATED]**:\n\n* **Siren Protocols**: Trigger localized Siren Arrays 1 through 4 in continuous sweep patterns.\n* **Alert Broadcasts**: Initiate cell-broadcast alerts to all active mobile devices within a 15km radius. Ensure message specifies clear visual vectors of threat movement.`;
      } else if (lower.includes("contain") || lower.includes("mitigate") || lower.includes("handle")) {
        responseText = `**Aegis Tactical Advisory [SIMULATED]**:\n\n* **Containment Operations**: Mobilize local heavy machinery (excavators, graders) to establish physical firebreaks or earthen dykes.\n* **Resource Allocation**: Reposition auxiliary water pumps and chemical flame-retardant air support crews to high-risk perimeter sections.`;
      } else if (incidentContext) {
        responseText = `**Aegis Tactical Advisory [SIMULATED]**:\n\nRegarding the active **${incidentContext.disasterType.toUpperCase()}** incident in **${incidentContext.locationName}** (Severity: **${incidentContext.severity.toUpperCase()}**):\n\n* **Priority Directive**: Address the key impact of *${incidentContext.keyImpacts[0] || "unspecified hazard factors"}*.\n* **Field Action**: Initiate the designated response directive: *"${incidentContext.recommendedActions[0] || "Establish safety zone"}"*.\n* **Tactical Advice**: Continue continuous monitoring. Coordinates at latitude ${incidentContext.coordinates.lat.toFixed(4)} are designated as primary emergency operational coordinates.`;
      } else {
        responseText = `**Aegis Tactical Advisory [SIMULATED]**:\n\nAegis Command Node is online. Please provide an active incident context or ask specific operational questions. Key tactical categories include:\n\n1. **Evacuation Mandates** (e.g. "Draft evac directive")\n2. **Containment Measures** (e.g. "Best way to mitigate wildfire/flood")\n3. **Alert Sirens** (e.g. "How to broadcast alarms")`;
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      return res.json({ text: responseText });
    }
  } catch (err: any) {
    console.error("Copilot route error:", err);
    res.status(500).json({ error: err.message || "Failed to process AI copilot query." });
  }
});

// Initialize Express/Vite full-stack system
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    // Production mode: Serve built client files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express web server active at: http://localhost:${PORT}`);
  });
}

startServer();
