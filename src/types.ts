export interface PredictionRecord {
  id: string;
  timestamp: string;
  disasterType: "wildfire" | "flood" | "earthquake" | "cyclone" | "landslide" | "normal";
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

export interface AlertRecord {
  id: string;
  timestamp: string;
  disasterId?: string;
  type: "SMS" | "Email" | "Radio Broadcast" | "Siren Network";
  disasterType: string;
  recipient: string;
  status: "Sent" | "Delivered" | "Failed";
  message: string;
}

export interface ReportRecord {
  id: string;
  timestamp: string;
  title: string;
  disasterType: string;
  severity: string;
  status: "Draft" | "Approved" | "Archived";
  content: string;
}

export interface AnalyticsData {
  disasterDistribution: { name: string; value: number }[];
  severityDistribution: { name: string; value: number }[];
  historicalTrends: { name: string; incidents: number; alerts: number }[];
  counters: {
    totalPredictions: number;
    totalAlerts: number;
    totalReports: number;
    unresolvedSevere: number;
  };
}
