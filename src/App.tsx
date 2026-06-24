import React, { useState, useEffect } from "react";
import { 
  Compass, 
  Sparkles, 
  Radio, 
  FileText, 
  Activity, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Flame,
  Waves,
  Wind,
  Mountain,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  X,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Dashboard from "./components/Dashboard";
import DetectionScanner from "./components/DetectionScanner";
import AlertsLog from "./components/AlertsLog";
import IncidentReports from "./components/IncidentReports";
import { PredictionRecord, AlertRecord, ReportRecord, AnalyticsData } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "scan" | "alerts" | "reports">("dashboard");
  
  // Data State loaded from full-stack Express Backend
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Time stamp state
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modal State for detailed single prediction viewing
  const [detailedPrediction, setDetailedPrediction] = useState<PredictionRecord | null>(null);

  // Broadcast Alert animation state
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);

  // Fetch all initial data
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [predRes, alertRes, repRes, analyticsRes] = await Promise.all([
        fetch("/api/predictions"),
        fetch("/api/alerts"),
        fetch("/api/reports"),
        fetch("/api/analytics"),
      ]);

      if (!predRes.ok || !alertRes.ok || !repRes.ok || !analyticsRes.ok) {
        throw new Error("Failed to sync backend metrics databases.");
      }

      const predictionsData = await predRes.json();
      const alertsData = await alertRes.json();
      const reportsData = await repRes.json();
      const analyticsData = await analyticsRes.json();

      setPredictions(predictionsData);
      setAlerts(alertsData);
      setReports(reportsData);
      setAnalytics(analyticsData);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Connection failure to the backend full-stack node API.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    // Set up ticking clock
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Polling analytics every 10 seconds to keep live metrics sync'd
    const analyticsTimer = setInterval(async () => {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (err) {
        console.warn("Analytics poll sync error:", err);
      }
    }, 10000);

    return () => {
      clearInterval(clockTimer);
      clearInterval(analyticsTimer);
    };
  }, []);

  const handlePredictionCompleteFromScanner = async (newPrediction: PredictionRecord) => {
    // Refresh predictions and analytics
    setPredictions((prev) => [newPrediction, ...prev]);
    // Retrieve new metrics
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleTriggerAlert = async (alertData: { disasterId?: string; type: any; recipient: string; message: string }) => {
    try {
      const response = await fetch("/api/alerts/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alertData),
      });

      if (response.ok) {
        const newAlert = await response.json();
        setAlerts((prev) => [newAlert, ...prev]);

        // Trigger dynamic alert broadcast animation overlay
        setBroadcastMessage(`[BROADCASTING] ${alertData.type.toUpperCase()} DISPATCHED TO: ${alertData.recipient.toUpperCase()} // MESSAGE: "${alertData.message}"`);
        setTimeout(() => {
          setBroadcastMessage(null);
        }, 5000);
        
        // Refresh predictions list in case alert status was toggled
        const predRes = await fetch("/api/predictions");
        const analyticsRes = await fetch("/api/analytics");
        if (predRes.ok && analyticsRes.ok) {
          setPredictions(await predRes.json());
          setAnalytics(await analyticsRes.json());
        }
      }
    } catch (err) {
      console.error("Failed to broadcast alert signal:", err);
    }
  };

  const handleGenerateReport = async (disasterId: string, title?: string) => {
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disasterId, title }),
      });

      if (response.ok) {
        const newReport = await response.json();
        setReports((prev) => [newReport, ...prev]);
        
        const analyticsRes = await fetch("/api/analytics");
        if (analyticsRes.ok) {
          setAnalytics(await analyticsRes.json());
        }
      }
    } catch (err) {
      console.error("Failed to compile incident situation report:", err);
    }
  };

  const getDisasterIcon = (type: string, size = 18) => {
    switch (type) {
      case "wildfire": return <Flame size={size} className="text-red-500 animate-pulse" />;
      case "flood": return <Waves size={size} className="text-blue-500" />;
      case "earthquake": return <Activity size={size} className="text-purple-500" />;
      case "cyclone": return <Wind size={size} className="text-teal-500" />;
      case "landslide": return <Mountain size={size} className="text-amber-700" />;
      default: return <CheckCircle2 size={size} className="text-green-500" />;
    }
  };

  const SEVERITY_COLORS = {
    low: "text-emerald-400 border-emerald-900 bg-emerald-950/20",
    medium: "text-amber-400 border-amber-900 bg-amber-950/20",
    high: "text-orange-400 border-orange-900 bg-orange-950/20",
    extreme: "text-red-400 border-red-900 bg-red-950/20",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans antialiased selection:bg-red-500/30 selection:text-white" id="main-app-shell">
      
      {/* Top Navigation Navigation Header */}
      <header className="bg-slate-900/90 border-b border-slate-800/80 sticky top-0 z-50 backdrop-blur-md" id="app-navigation-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Brand & System Status Tags */}
          <div className="flex items-center gap-3">
            <div className="bg-red-950/60 border border-red-800/40 p-2.5 rounded-xl shadow-lg shadow-red-500/5 text-red-500">
              <ShieldAlert size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold font-mono tracking-wider text-slate-100 uppercase">
                  Aegis AI Disaster Detection Core
                </h1>
                <span className="bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded text-[8px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> SCANNER ACTIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wide mt-0.5 uppercase">
                National Multi-hazard Surveillance Ledger Platform // System v3.5-PRO
              </p>
            </div>
          </div>

          {/* Clock, Sync & Active Operations Telemetry */}
          <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-mono" id="telemetry-bar">
            <div className="bg-slate-950 border border-slate-850 px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-slate-300">
              <Clock size={13} className="text-teal-400" />
              <span>UTC: {currentTime.toISOString().replace("T", " ").substring(0, 19)}</span>
            </div>
            
            <button
              id="btn-manual-sync-databases"
              onClick={fetchAllData}
              title="Manual Telemetry Recalculation"
              className="bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-850 hover:border-slate-800 p-2 rounded-lg cursor-pointer transition-colors"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin text-teal-400" : ""} />
            </button>
          </div>

        </div>

        {/* Tab Selection Row */}
        <div className="border-t border-slate-800/50" id="tabs-navigation-panel">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 py-1.5" aria-label="Tabs">
              <button
                id="tab-btn-dashboard"
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 text-xs font-mono font-medium tracking-wider uppercase rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-slate-800 text-teal-400 font-bold border border-slate-750"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <Compass size={14} />
                Command Dashboard
              </button>

              <button
                id="tab-btn-scanner"
                onClick={() => setActiveTab("scan")}
                className={`px-4 py-2 text-xs font-mono font-medium tracking-wider uppercase rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "scan"
                    ? "bg-slate-800 text-teal-400 font-bold border border-slate-750"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <Sparkles size={14} />
                Neural Scanner
              </button>

              <button
                id="tab-btn-alerts"
                onClick={() => setActiveTab("alerts")}
                className={`px-4 py-2 text-xs font-mono font-medium tracking-wider uppercase rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "alerts"
                    ? "bg-slate-800 text-teal-400 font-bold border border-slate-750"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <Radio size={14} />
                Sirens & Broadcasts
              </button>

              <button
                id="tab-btn-reports"
                onClick={() => setActiveTab("reports")}
                className={`px-4 py-2 text-xs font-mono font-medium tracking-wider uppercase rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "reports"
                    ? "bg-slate-800 text-teal-400 font-bold border border-slate-750"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                }`}
              >
                <FileText size={14} />
                Incident Reports
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Core Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative" id="app-main-viewport">
        
        {/* Animated Emergency Broadcast Banner */}
        <AnimatePresence>
          {broadcastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-6 rounded-xl overflow-hidden border border-red-500/50 shadow-2xl shadow-red-950/40 z-50 relative"
              id="broadcast-alarm-animation"
            >
              {/* Flashing Warning stripe header */}
              <div className="h-4 bg-[repeating-linear-gradient(45deg,#ef4444,#ef4444_15px,#991b1b_15px,#991b1b_30px)] animate-[pulse_1s_infinite]" />
              
              <div className="bg-slate-950 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-red-950 border border-red-800 p-2 rounded-lg text-red-500 animate-[ping_1.5s_infinite] shrink-0">
                    <Radio size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-red-400 tracking-widest uppercase flex items-center gap-2">
                      <span>●</span> ACTIVE CIVIL BROADCAST DISPATCH PROTOCOL
                    </h4>
                    <p className="text-sm font-semibold font-sans text-slate-100 mt-1 leading-relaxed">
                      {broadcastMessage}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setBroadcastMessage(null)}
                  className="bg-red-950/60 hover:bg-red-900/60 text-red-400 border border-red-900/40 font-mono text-[10px] px-3 py-1.5 rounded uppercase cursor-pointer"
                >
                  Silence Alert
                </button>
              </div>

              {/* Progress bar tracker */}
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="h-1 bg-red-600"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-4 text-sm font-mono text-red-400 flex items-center gap-2 mb-6" id="app-error-banner">
            <AlertTriangle size={18} />
            <div>
              <p className="font-bold">SYSTEM TELEMETRY ERROR</p>
              <p className="text-xs text-red-400/85 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {isLoading && !analytics ? (
          <div className="flex-1 h-96 flex flex-col items-center justify-center space-y-3" id="app-loading-placeholder">
            <RefreshCw className="animate-spin text-teal-500" size={32} />
            <p className="text-xs font-mono text-slate-400">CONNECTING WITH MULTI-HAZARD DATABASES...</p>
          </div>
        ) : analytics ? (
          <div id="active-tab-content">
            {activeTab === "dashboard" && (
              <Dashboard 
                analytics={analytics} 
                predictions={predictions} 
                alerts={alerts}
                onSelectPrediction={(p) => setDetailedPrediction(p)}
                onNavigateToScanner={() => setActiveTab("scan")}
                onTriggerAlert={handleTriggerAlert}
                onRefreshData={fetchAllData}
              />
            )}

            {activeTab === "scan" && (
              <DetectionScanner 
                onPredictionComplete={handlePredictionCompleteFromScanner} 
              />
            )}

            {activeTab === "alerts" && (
              <AlertsLog 
                alerts={alerts} 
                onTriggerAlert={handleTriggerAlert} 
              />
            )}

            {activeTab === "reports" && (
              <IncidentReports 
                reports={reports} 
                predictions={predictions} 
                onGenerateReport={handleGenerateReport} 
              />
            )}
          </div>
        ) : null}
      </main>

      {/* Dynamic Modal View for Detailed Incident Analytics */}
      {detailedPrediction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" id="detailed-incident-modal">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative" id="modal-container">
            
            {/* Image banner */}
            {detailedPrediction.imageUrl ? (
              <div className="relative h-60 w-full overflow-hidden" id="modal-image-box">
                <img 
                  src={detailedPrediction.imageUrl} 
                  alt="Field feed imagery" 
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                <button
                  id="btn-close-modal-top"
                  onClick={() => setDetailedPrediction(null)}
                  className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 p-2 rounded-full text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-4 left-6 flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 border rounded-full ${
                    detailedPrediction.severity === "extreme" ? "bg-red-950/70 text-red-400 border-red-900/60" :
                    detailedPrediction.severity === "high" ? "bg-orange-950/70 text-orange-400 border-orange-900/60" :
                    "bg-amber-950/70 text-amber-400 border-amber-900/60"
                  }`}>
                    {detailedPrediction.severity} Severity
                  </span>
                  <span className="text-xs text-emerald-400 font-mono font-bold bg-black/60 px-2 py-0.5 rounded">
                    Confidence: {(detailedPrediction.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-6 pb-2 flex justify-between items-start border-b border-slate-800/60">
                <h3 className="text-base font-bold font-mono text-slate-300">Incident Telemetry Ledger</h3>
                <button
                  id="btn-close-modal-alternate"
                  onClick={() => setDetailedPrediction(null)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <div className="p-6 space-y-5" id="modal-content-scroll">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getDisasterIcon(detailedPrediction.disasterType, 22)}
                  <h3 className="text-lg font-bold text-slate-100 capitalize">
                    {detailedPrediction.disasterType} Event Profile
                  </h3>
                </div>
                <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <MapPin size={12} className="text-slate-500" />
                  {detailedPrediction.locationName}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  REF: {detailedPrediction.id} // SECURE ENCRYPTION NODE LEVEL A
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide">Scene Summary Analysis</h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3.5 rounded-lg border border-slate-850">
                  {detailedPrediction.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl space-y-1.5">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide">Observable Environmental Impacts</h4>
                  <ul className="text-[11px] text-slate-400 space-y-1.5 pl-3 list-disc">
                    {detailedPrediction.keyImpacts.map((imp, idx) => (
                      <li key={idx} className="leading-snug">{imp}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl space-y-1.5">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide">Immediate Civil Directives</h4>
                  <ul className="text-[11px] text-slate-400 space-y-1.5 pl-3 list-disc">
                    {detailedPrediction.recommendedActions.map((act, idx) => (
                      <li key={idx} className="leading-snug">{act}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Affected Area Grid Size</span>
                  <span className="text-slate-300 font-bold mt-0.5 block">{detailedPrediction.affectedAreaEstimate}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Gis Coordinate Decimals</span>
                  <span className="text-slate-300 font-bold mt-0.5 block">
                    {detailedPrediction.coordinates.lat.toFixed(4)}, {detailedPrediction.coordinates.lng.toFixed(4)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Warning Alarm Telemetry</span>
                  <span className={`font-bold mt-0.5 block ${detailedPrediction.alertBroadcasted ? "text-emerald-400" : "text-amber-500 animate-pulse"}`}>
                    {detailedPrediction.alertBroadcasted ? "BROADCASTED" : "ALARM PENDING"}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-850 flex justify-end gap-2" id="modal-footer-actions">
                <button
                  id="btn-close-modal-main"
                  onClick={() => setDetailedPrediction(null)}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-mono text-xs px-5 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  Close Profile
                </button>
                {!detailedPrediction.alertBroadcasted && (
                  <button
                    id="btn-modal-manual-broadcast"
                    onClick={() => {
                      handleTriggerAlert({
                        disasterId: detailedPrediction.id,
                        type: "SMS",
                        recipient: `${detailedPrediction.locationName} Emergency Grid`,
                        message: `CRITICAL LEVEL EMERGENCY WARNING: Active ${detailedPrediction.disasterType.toUpperCase()} identified at ${detailedPrediction.locationName}. Active zone coordinate pins deployed.`
                      });
                      setDetailedPrediction(null);
                      setActiveTab("alerts");
                    }}
                    className="bg-red-800 hover:bg-red-700 text-white font-mono text-xs px-5 py-2 rounded-lg font-bold border border-red-500 cursor-pointer transition-colors"
                  >
                    Broadcast Emergency Signal
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Footer System Credits */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6" id="app-system-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <p className="text-xs text-slate-500 font-mono uppercase tracking-wide">
              Aegis Systems Core Infrastructure // Secure Tunnel Link
            </p>
          </div>
          <p className="text-[10px] text-slate-600 font-mono text-center md:text-right uppercase">
            Designed for Multi-modal disaster classification & localized alerts generation. © 2026 Aegis Defense Core.
          </p>
        </div>
      </footer>

    </div>
  );
}
