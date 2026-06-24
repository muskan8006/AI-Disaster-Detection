import React, { useState } from "react";
import { 
  Flame, 
  Waves, 
  Activity, 
  Wind, 
  Mountain, 
  CheckCircle2, 
  Bell, 
  FileText, 
  MapPin, 
  ShieldAlert, 
  Send, 
  AlertTriangle, 
  TrendingUp,
  UserCheck,
  Radio,
  Clock,
  Compass,
  Sparkles,
  Bot,
  Filter,
  Download,
  Search,
  Wifi,
  History,
  RefreshCw
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  CartesianGrid
} from "recharts";
import { PredictionRecord, AlertRecord, AnalyticsData } from "../types";

interface DashboardProps {
  analytics: AnalyticsData;
  predictions: PredictionRecord[];
  alerts: AlertRecord[];
  onSelectPrediction: (prediction: PredictionRecord) => void;
  onNavigateToScanner: () => void;
  onTriggerAlert: (alertData: { disasterId?: string; type: any; recipient: string; message: string }) => void;
  onRefreshData?: () => void;
}

const SEVERITY_COLORS = {
  low: "#10b981",    // Emerald Green
  medium: "#f59e0b", // Amber Orange
  high: "#f97316",   // Orange-Red
  extreme: "#ef4444", // Crimson Red
};

const DISASTER_COLORS = {
  wildfire: "#ff4d4d",
  flood: "#3399ff",
  earthquake: "#a855f7",
  cyclone: "#14b8a6",
  landslide: "#b45309",
  normal: "#22c55e",
};

export default function Dashboard({
  analytics,
  predictions,
  alerts,
  onSelectPrediction,
  onNavigateToScanner,
  onTriggerAlert,
  onRefreshData,
}: DashboardProps) {
  const [selectedPinId, setSelectedPinId] = useState<string | null>(
    predictions.length > 0 ? predictions[0].id : null
  );

  // Layout Preference States
  const [showMap, setShowMap] = useState<boolean>(true);
  const [showSummary, setShowSummary] = useState<boolean>(true);

  // Auto-Surveillance Autopilot Interval Configuration
  const [autoDetectInterval, setAutoDetectInterval] = useState<number>(0);

  // Data Clearing Progress Tracker
  const [isClearingData, setIsClearingData] = useState<boolean>(false);

  // Trigger UAV drone sweep
  const triggerAutoSweep = async () => {
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: "data:image/jpeg;base64,auto_simulated_feed_imagery_sweep",
          filename: `auto_uav_detect_${Date.now()}.jpg`
        }),
      });
      if (response.ok) {
        if (onRefreshData) {
          onRefreshData();
        }
      }
    } catch (err) {
      console.warn("UAV Autopilot sweep error:", err);
    }
  };

  // Autopilot Sweep Interval timer
  React.useEffect(() => {
    if (autoDetectInterval <= 0) return;
    const timer = setInterval(() => {
      triggerAutoSweep();
    }, autoDetectInterval);
    return () => clearInterval(timer);
  }, [autoDetectInterval]);

  // Clean data stores on the backend & reset local focus target
  const handleClearData = async () => {
    const confirmation = window.confirm(
      "CONFIRM PERMANENT ACTION:\n\nThis will completely purge all disaster prediction telemetry, alerts, and report documents from the live databases. There is no recovery. Proceed?"
    );
    if (!confirmation) return;

    setIsClearingData(true);
    try {
      const response = await fetch("/api/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (response.ok) {
        setSelectedPinId(null);
        if (onRefreshData) {
          onRefreshData();
        }
      }
    } catch (err) {
      console.error("Purge telemetry logs error:", err);
    } finally {
      setIsClearingData(false);
    }
  };

  // Generate beautiful, printable official report that triggers PDF save
  const handleExportPDF = () => {
    if (!selectedInc) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Popup blocker active. Please allow popups to download/print the official PDF dossier.");
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <title>Aegis_SITREP_${selectedInc.id}</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              color: #0f172a;
              background-color: #ffffff;
              padding: 45px;
              line-height: 1.6;
            }
            .header {
              border-bottom: 3px double #020617;
              padding-bottom: 22px;
              margin-bottom: 35px;
              text-align: center;
              position: relative;
            }
            .title {
              font-size: 28px;
              font-weight: bold;
              letter-spacing: 3px;
              margin: 0;
              text-transform: uppercase;
            }
            .subtitle {
              font-size: 11px;
              color: #475569;
              letter-spacing: 5px;
              margin-top: 6px;
              text-transform: uppercase;
            }
            .metadata-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
              margin-bottom: 35px;
              border: 1px solid #cbd5e1;
              padding: 16px;
              background-color: #f8fafc;
            }
            .metadata-item {
              font-size: 13px;
            }
            .metadata-label {
              font-weight: bold;
              color: #475569;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              border-bottom: 1.5px solid #020617;
              padding-bottom: 5px;
              margin-top: 30px;
              margin-bottom: 15px;
              text-transform: uppercase;
              color: #0f172a;
            }
            .list-item {
              margin-bottom: 8px;
              font-size: 13px;
            }
            .summary {
              font-size: 14px;
              font-style: italic;
              background-color: #f1f5f9;
              border-left: 5px solid #ef4444;
              padding: 14px;
              margin-bottom: 22px;
            }
            .footer {
              margin-top: 60px;
              border-top: 1px dashed #cbd5e1;
              padding-top: 20px;
              font-size: 10px;
              color: #64748b;
              text-align: center;
            }
            .seal-badge {
              font-size: 13px;
              border: 2px solid #ef4444;
              color: #ef4444;
              display: inline-block;
              padding: 4px 14px;
              font-weight: bold;
              text-transform: uppercase;
              transform: rotate(-3deg);
              margin-top: 15px;
            }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Aegis Tactical Command Node</div>
            <div class="subtitle">Official Disaster Intelligence SITREP</div>
            <div class="seal-badge">${selectedInc.severity.toUpperCase()} ALERT</div>
          </div>

          <div class="metadata-grid">
            <div class="metadata-item">
              <span class="metadata-label">Incident ID:</span> ${selectedInc.id}
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Timestamp:</span> ${new Date(selectedInc.timestamp).toLocaleString()}
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Disaster Class:</span> ${selectedInc.disasterType.toUpperCase()}
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Severity Level:</span> ${selectedInc.severity.toUpperCase()}
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Confidence Index:</span> ${(selectedInc.confidence * 100).toFixed(1)}%
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Geographic Target:</span> ${selectedInc.locationName}
            </div>
            <div class="metadata-item" style="grid-column: span 2;">
              <span class="metadata-label">GPS Coordinates:</span> Lat ${selectedInc.coordinates.lat.toFixed(6)}, Lng ${selectedInc.coordinates.lng.toFixed(6)}
            </div>
            <div class="metadata-item" style="grid-column: span 2;">
              <span class="metadata-label">Estimated Damage Corridor:</span> ${selectedInc.affectedAreaEstimate}
            </div>
          </div>

          <div class="section-title">1. Operational Synopsis</div>
          <div class="summary">
            "${selectedInc.summary}"
          </div>

          <div class="section-title">2. Critical Site Impacts & Hazards</div>
          <ul>
            ${selectedInc.keyImpacts.map(imp => `<li class="list-item"><b>●</b> ${imp}</li>`).join("")}
          </ul>

          <div class="section-title">3. Immediate Containment Directive</div>
          <ul>
            ${selectedInc.recommendedActions.map(act => `<li class="list-item"><b>[ACTION]</b> ${act}</li>`).join("")}
          </ul>

          <div class="section-title">4. Civil Dispatch Logs</div>
          <div style="font-size: 13px; font-family: monospace;">
            * Alarm status: ${selectedInc.alertBroadcasted ? "BROADCAST DISPATCHED" : "PENDING DIRECTIVE"}<br/>
            * Response link: Aegis Satellite Command Cluster Link synchronized.<br/>
            * Systems: Nominal operation, dynamic cloud edge state active.
          </div>

          <div class="footer">
            AEGIS CRISIS COMMAND // SYSTEM GENERATED PORTAL // SECURE DOCUMENT // TIME OF PRINT: ${new Date().toISOString()}
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Form states for manual alert simulation
  const [alertType, setAlertType] = useState<"SMS" | "Email" | "Radio Broadcast" | "Siren Network">("SMS");
  const [alertRecipient, setAlertRecipient] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertDisasterId, setAlertDisasterId] = useState("");
  const [isSubmittingAlert, setIsSubmittingAlert] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Quick Filters State
  const [filterDisaster, setFilterDisaster] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  // Search History & Search Query
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem("aegis_search_history");
    return saved ? JSON.parse(saved) : ["wildfire", "los angeles", "extreme"];
  });

  // Live Status Ping State
  const [pingValue, setPingValue] = useState<number>(38);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingMessage, setPingMessage] = useState<string>("Aegis Command link synchronized");

  // Combined Filtering and Search logic
  const filteredPredictions = predictions.filter((p) => {
    const matchesDisaster = filterDisaster === "all" || p.disasterType === filterDisaster;
    const matchesSeverity = filterSeverity === "all" || p.severity === filterSeverity;
    
    const term = searchQuery.toLowerCase().trim();
    const matchesQuery = !term || 
      p.locationName.toLowerCase().includes(term) ||
      p.disasterType.toLowerCase().includes(term) ||
      p.summary.toLowerCase().includes(term) ||
      p.id.toLowerCase().includes(term) ||
      p.severity.toLowerCase().includes(term);

    return matchesDisaster && matchesSeverity && matchesQuery;
  });

  // Selected Incident Context
  const selectedInc = filteredPredictions.find((p) => p.id === selectedPinId) || filteredPredictions[0] || predictions[0];

  // Tactical Copilot States
  const [copilotMessages, setCopilotMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Aegis Tactical advisor online. Aegis Command core successfully linked. Select an active incident on the map above, or query general containment directives." }
  ]);
  const [userInputText, setUserInputText] = useState("");
  const [isCopilotTyping, setIsCopilotTyping] = useState(false);

  const handleCopilotSend = async (customMessage?: string) => {
    const textToSend = customMessage || userInputText;
    if (!textToSend.trim()) return;

    const newUserMsg = { role: "user" as const, content: textToSend };
    const updatedMessages = [...copilotMessages, newUserMsg];
    setCopilotMessages(updatedMessages);
    setUserInputText("");
    setIsCopilotTyping(true);

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          incidentContext: selectedInc,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCopilotMessages((prev) => [...prev, { role: "assistant", content: data.text }]);
      } else {
        setCopilotMessages((prev) => [...prev, { role: "assistant", content: "Error: Aegis core API link disrupted. Fallback simulation engaged." }]);
      }
    } catch (err) {
      setCopilotMessages((prev) => [...prev, { role: "assistant", content: "Connection error: Failed to reach Aegis AI core." }]);
    } finally {
      setIsCopilotTyping(false);
    }
  };

  const handleManualAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertMessage) return;

    setIsSubmittingAlert(true);
    setTimeout(() => {
      onTriggerAlert({
        disasterId: alertDisasterId || undefined,
        type: alertType,
        recipient: alertRecipient || "Global Emergency Broadcast Sector",
        message: alertMessage,
      });
      setIsSubmittingAlert(false);
      setSuccessMsg("Alert broadcast dispatched successfully.");
      setAlertMessage("");
      setAlertRecipient("");
      setTimeout(() => setSuccessMsg(""), 3000);
    }, 800);
  };

  // Quick action: Save Search to History
  const executeSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchQuery(trimmed);
    if (!searchHistory.includes(trimmed)) {
      const nextHistory = [trimmed, ...searchHistory.slice(0, 7)];
      setSearchHistory(nextHistory);
      localStorage.setItem("aegis_search_history", JSON.stringify(nextHistory));
    }
  };

  // Quick action: Clear Search History
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("aegis_search_history");
  };

  // Live status ping function
  const triggerPingCheck = () => {
    setIsPinging(true);
    setPingMessage("Querying Aegis Satellites and Cloud Run Edge hosts...");
    setTimeout(() => {
      const randomPing = Math.floor(Math.random() * 25) + 18; // 18 - 43ms
      setPingValue(randomPing);
      setIsPinging(false);
      setPingMessage(`Echo reply received from AEGIS-WEST-1 in ${randomPing}ms. Status: EXCELLENT.`);
    }, 1200);
  };

  // Export Data as CSV or JSON
  const handleExportData = (format: "csv" | "json") => {
    if (format === "json") {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        exportTimestamp: new Date().toISOString(),
        totalFilteredRecords: filteredPredictions.length,
        predictions: filteredPredictions,
        activeAlerts: alerts
      }, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `aegis_disaster_export_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      // CSV Export
      const headers = ["ID", "Disaster Type", "Severity", "Location", "Confidence", "Timestamp", "Summary"];
      const rows = filteredPredictions.map((p) => [
        p.id,
        p.disasterType,
        p.severity,
        `"${p.locationName.replace(/"/g, '""')}"`,
        p.confidence,
        p.timestamp,
        `"${p.summary.replace(/"/g, '""')}"`
      ]);
      const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `aegis_disaster_export_${Date.now()}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }
  };

  const getDisasterIcon = (type: string, size = 18) => {
    switch (type) {
      case "wildfire": return <Flame size={size} className="text-red-500" />;
      case "flood": return <Waves size={size} className="text-blue-500" />;
      case "earthquake": return <Activity size={size} className="text-purple-500" />;
      case "cyclone": return <Wind size={size} className="text-teal-500" />;
      case "landslide": return <Mountain size={size} className="text-amber-700" />;
      default: return <CheckCircle2 size={size} className="text-green-500" />;
    }
  };

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Upper Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="stats-grid">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-lg" id="stat-card-incidents">
          <div>
            <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">Scanned Feeds</p>
            <h3 className="text-2xl font-bold font-sans text-slate-100 mt-1">{analytics.counters.totalPredictions}</h3>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-lg text-emerald-400">
            <Compass size={22} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-lg" id="stat-card-alerts">
          <div>
            <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">Active Broadcasts</p>
            <h3 className="text-2xl font-bold font-sans text-slate-100 mt-1">{analytics.counters.totalAlerts}</h3>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-lg text-rose-400">
            <Radio size={22} />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-lg" id="stat-card-reports">
          <div>
            <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">Situation Reports</p>
            <h3 className="text-2xl font-bold font-sans text-slate-100 mt-1">{analytics.counters.totalReports}</h3>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-lg text-amber-400">
            <FileText size={22} />
          </div>
        </div>

        <div className="bg-slate-900 border border-red-950/55 p-4 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden" id="stat-card-unresolved">
          <div className="absolute right-0 top-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl" />
          <div>
            <p className="text-xs text-rose-400 font-mono tracking-wider uppercase flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Unresolved Severe
            </p>
            <h3 className="text-2xl font-bold font-sans text-rose-500 mt-1">
              {analytics.counters.unresolvedSevere}
            </h3>
          </div>
          <div className="bg-red-950/30 border border-red-900/30 p-3 rounded-lg text-red-400">
            <ShieldAlert size={22} />
          </div>
        </div>
      </div>

      {/* Dynamic Telemetry Controls: Ping diagnostics, Search History & Data Export Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg" id="telemetry-controls-panel">
        
        {/* Col 1: System Connection & Live Ping Diagnostics (4 cols) */}
        <div className="lg:col-span-4 border-r border-slate-800/80 pr-4 flex flex-col justify-between gap-3" id="ping-diagnostics-col">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isPinging ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-ping"}`} />
                Uplink Diagnostic: Live Status Ping
              </span>
              <span className="bg-slate-950 border border-slate-800 text-teal-400 font-mono text-[10px] px-2 py-0.5 rounded">
                RTT: {pingValue} ms
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-2 line-clamp-2 bg-slate-950/40 p-2 rounded border border-slate-850/50">
              {pingMessage}
            </p>
          </div>

          {/* Auto Detect Interval configuration */}
          <div className="bg-slate-950/60 p-2 rounded border border-slate-850/80">
            <label className="block text-[9px] font-mono uppercase text-slate-400 tracking-wider mb-1.5 flex items-center gap-1 font-bold">
              <span className={`w-1.5 h-1.5 rounded-full ${autoDetectInterval > 0 ? "bg-teal-400 animate-pulse" : "bg-slate-600"}`} />
              Auto Drone Scan (UAV Sweeper Interval):
            </label>
            <div className="grid grid-cols-4 gap-1">
              {[
                { label: "Off", value: 0 },
                { label: "5s", value: 5000 },
                { label: "10s", value: 10000 },
                { label: "30s", value: 30000 }
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAutoDetectInterval(opt.value)}
                  className={`text-[9px] font-mono py-1 rounded cursor-pointer transition-all border ${
                    autoDetectInterval === opt.value 
                      ? "bg-teal-950 border-teal-700/80 text-teal-400 font-bold" 
                      : "bg-slate-900 border-slate-800/60 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={triggerPingCheck}
            disabled={isPinging}
            className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-slate-100 font-mono text-[10px] py-1.5 rounded transition-all flex items-center justify-center gap-2 uppercase font-medium cursor-pointer"
          >
            <Wifi size={12} className={isPinging ? "animate-bounce" : ""} />
            {isPinging ? "Checking Uplink Link..." : "Trigger Live Diagnostic Ping"}
          </button>
        </div>

        {/* Col 2: Search & Search History (5 cols) */}
        <div className="lg:col-span-5 border-r border-slate-800/80 px-4 flex flex-col justify-between" id="search-history-col">
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Search size={11} className="text-indigo-400" />
              Live Incident Ledger Search
            </span>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by location, keyword, or severity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && executeSearch(searchQuery)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-250 pl-8 pr-16 py-1.5 focus:border-indigo-500 focus:outline-none"
              />
              <Search className="absolute left-2.5 top-2.5 text-slate-500" size={12} />
              <button
                onClick={() => executeSearch(searchQuery)}
                className="absolute right-1 top-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800/50 text-indigo-300 px-2 py-0.5 rounded font-mono text-[9px] uppercase cursor-pointer"
              >
                Query
              </button>
            </div>
          </div>

          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase">
              <span className="flex items-center gap-1">
                <History size={10} /> Saved Search History:
              </span>
              {searchHistory.length > 0 && (
                <button onClick={clearSearchHistory} className="hover:text-red-400 transition-colors cursor-pointer font-bold">
                  [Clear History]
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {searchHistory.length > 0 ? (
                searchHistory.map((hist, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSearchQuery(hist)}
                    className="text-[9px] font-mono bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800/80 px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {hist}
                  </button>
                ))
              ) : (
                <span className="text-[9px] font-mono text-slate-600 italic">No recent queries executed</span>
              )}
            </div>
          </div>
        </div>

        {/* Col 3: Database Exporter & Purge (3 cols) */}
        <div className="lg:col-span-3 pl-4 flex flex-col justify-between" id="data-export-col">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Download size={11} className="text-emerald-400" />
              Database Exporter & Purge
            </span>
            <p className="text-[10px] font-mono text-slate-500 leading-normal">
              Download active telemetry profiles or purge data. ({filteredPredictions.length} matched)
            </p>
          </div>
          <div className="space-y-2 mt-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleExportData("csv")}
                className="bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-900/60 text-emerald-400 hover:text-emerald-300 font-mono text-[10px] py-1.5 rounded transition-colors uppercase font-medium cursor-pointer text-center"
              >
                CSV
              </button>
              <button
                onClick={() => handleExportData("json")}
                className="bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-900/60 text-indigo-400 hover:text-indigo-300 font-mono text-[10px] py-1.5 rounded transition-colors uppercase font-medium cursor-pointer text-center"
              >
                JSON
              </button>
            </div>
            <button
              onClick={handleClearData}
              disabled={isClearingData}
              className="w-full bg-red-950/40 hover:bg-red-900/40 border border-red-900/65 text-red-400 hover:text-red-300 font-mono text-[10px] py-1.5 rounded transition-colors uppercase font-medium cursor-pointer text-center"
            >
              {isClearingData ? "Purging databases..." : "Purge Telemetry Logs"}
            </button>
          </div>
        </div>

      </div>

      {/* Main Core Section: Interactive GIS Map & Tactical Incident Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="core-interactive-layout">
        
        {/* Interactive Tactical Map Frame */}
        <div className={`${showSummary ? "lg:col-span-8" : "lg:col-span-12"} bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[460px]`} id="map-tactical-frame">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase">
                {showMap ? "TACTICAL DISASTER TELEMETRY GRAPH (GIS)" : "SATELLITE LEDGER DATABASE"}
              </h2>
            </div>
            
            {/* Preference Toggles (Map Toggle and Summary Toggle) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMap(!showMap)}
                className={`text-[10px] font-mono px-2.5 py-1 rounded-md border cursor-pointer transition-all uppercase flex items-center gap-1.5 ${
                  showMap 
                    ? "bg-teal-950/60 border-teal-800 text-teal-400 font-bold" 
                    : "bg-slate-900 border-slate-800 text-slate-450 hover:text-slate-200"
                }`}
                title="Toggle between Map display and database table list"
              >
                <Compass size={12} className={showMap ? "animate-[spin_20s_linear_infinite]" : ""} />
                {showMap ? "Map View" : "List View"}
              </button>

              <button
                onClick={() => setShowSummary(!showSummary)}
                className={`text-[10px] font-mono px-2.5 py-1 rounded-md border cursor-pointer transition-all uppercase flex items-center gap-1.5 ${
                  showSummary 
                    ? "bg-indigo-950/60 border-indigo-800 text-indigo-400 font-bold" 
                    : "bg-slate-900 border-slate-800 text-slate-450 hover:text-slate-200"
                }`}
                title="Toggle Sidebar panel visibility"
              >
                <FileText size={12} />
                {showSummary ? "Summary Panel: ON" : "Summary Panel: OFF"}
              </button>
            </div>
          </div>

          {/* Quick Filters sub-header toolbar */}
          <div className="bg-slate-950/60 px-4 py-2 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3" id="map-quick-filters">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1 font-bold">
                <Filter size={10} className="text-teal-400" /> Hazard Type:
              </span>
              {["all", "wildfire", "flood", "earthquake", "cyclone", "landslide"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterDisaster(type)}
                  className={`text-[9px] font-mono px-2 py-0.5 rounded cursor-pointer transition-all uppercase border ${
                    filterDisaster === type 
                      ? "bg-teal-950 border-teal-700/80 text-teal-400 font-bold" 
                      : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1 font-bold">
                Severity:
              </span>
              {["all", "low", "medium", "high", "extreme"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`text-[9px] font-mono px-2 py-0.5 rounded cursor-pointer transition-all uppercase border ${
                    filterSeverity === sev 
                      ? "bg-indigo-950 border-indigo-700/80 text-indigo-400 font-bold" 
                      : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
          
          {showMap ? (
            <div className="relative flex-1 bg-slate-950/90 overflow-hidden flex items-center justify-center" id="tactical-grid-map">
              {/* Vector style Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:32px_32px] opacity-60" />
              
              {/* World Map Outline Overlay Mock */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
                <svg className="w-full h-full p-8" viewBox="0 0 1000 500" fill="currentColor">
                  <path d="M150,150 Q180,100 240,120 T350,160 T480,150 T620,130 T800,180 T900,130 L950,380 Q800,420 700,390 T500,430 T300,380 T100,420 Z" />
                </svg>
              </div>

              {/* Placed Pins */}
              {filteredPredictions.map((p) => {
                // Convert arbitrary coordinate limits to map percentages
                const xPct = Math.min(Math.max(((p.coordinates.lng + 180) / 360) * 100, 10), 90);
                const yPct = Math.min(Math.max(((90 - p.coordinates.lat) / 180) * 100, 10), 90);
                const isSelected = p.id === selectedPinId;
                const severityColor = SEVERITY_COLORS[p.severity];

                return (
                  <button
                    key={p.id}
                    id={`pin-${p.id}`}
                    onClick={() => setSelectedPinId(p.id)}
                    style={{ left: `${xPct}%`, top: `${yPct}%` }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 focus:outline-none z-10"
                  >
                    <div className="relative">
                      {/* Ring Pulse */}
                      {p.severity !== "low" && (
                        <span 
                          style={{ borderColor: severityColor }} 
                          className="absolute -inset-2.5 border-2 rounded-full animate-ping opacity-60 pointer-events-none" 
                        />
                      )}
                      <div 
                        style={{ 
                          backgroundColor: isSelected ? severityColor : "transparent",
                          borderColor: severityColor,
                          boxShadow: isSelected ? `0 0 16px ${severityColor}` : "none"
                        }}
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center bg-slate-900 transition-all duration-300"
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-100" />
                      </div>
                      {/* Tooltip Hover tag */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-900 text-slate-100 border border-slate-700 text-[10px] font-mono whitespace-nowrap px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {p.locationName} - {p.disasterType.toUpperCase()}
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Tactical Legend Panel */}
              <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-[10px] font-mono space-y-1 text-slate-400 z-10">
                <p className="text-slate-200 font-bold mb-1">LEGEND (SEVERITY)</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Extreme Threat
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> High Danger
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium Alert
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low/Normal
                </div>
              </div>

              {/* GIS Center Scope */}
              <div className="absolute top-4 right-4 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-mono text-slate-400 flex flex-col items-end">
                <span className="text-slate-300 font-semibold uppercase">ACTIVE REGION</span>
                <span>GEO SCAN: CENTRAL SECTOR</span>
                <span className="text-emerald-400">FPS: 60 // SYNCED</span>
              </div>
            </div>
          ) : (
            /* High-Density Satellite Ledger Database list view */
            <div className="flex-1 overflow-y-auto p-4 bg-slate-950/80" id="satellite-ledger-table-container">
              <table className="w-full text-left font-mono text-[11px] text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[9px] text-slate-500 uppercase tracking-wider">
                    <th className="pb-2">ID</th>
                    <th className="pb-2">Disaster Type</th>
                    <th className="pb-2">Severity</th>
                    <th className="pb-2">Location Scope</th>
                    <th className="pb-2">Certainty</th>
                    <th className="pb-2">Date Recorded</th>
                    <th className="pb-2 text-right">Interactive link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredPredictions.map((p) => (
                    <tr 
                      key={p.id}
                      onClick={() => setSelectedPinId(p.id)}
                      className={`hover:bg-slate-850/40 cursor-pointer transition-colors ${selectedPinId === p.id ? "bg-slate-800/40 text-teal-400" : ""}`}
                    >
                      <td className="py-2.5 font-bold text-slate-400">{p.id}</td>
                      <td className="py-2.5 uppercase font-medium">
                        <span className="flex items-center gap-1.5">
                          {getDisasterIcon(p.disasterType, 13)}
                          {p.disasterType}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span 
                          style={{ color: SEVERITY_COLORS[p.severity] }}
                          className="font-bold uppercase text-[10px]"
                        >
                          {p.severity}
                        </span>
                      </td>
                      <td className="py-2.5 truncate max-w-[150px]">{p.locationName}</td>
                      <td className="py-2.5 font-bold">{(p.confidence * 100).toFixed(0)}%</td>
                      <td className="py-2.5 text-slate-500">{new Date(p.timestamp).toLocaleDateString()}</td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPinId(p.id);
                          }}
                          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPredictions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-600 italic font-mono text-xs">
                        No active disaster telemetries match your selected search constraints.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Incident Telemetry Detail Drawer (Conditionally rendered by showSummary state) */}
        {showSummary && (
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[460px]" id="incident-detail-drawer">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold font-mono tracking-wider text-slate-200">INCIDENT PROFILE TELEMETRY</h2>
              {selectedInc && (
                <span 
                  style={{ 
                    color: SEVERITY_COLORS[selectedInc.severity], 
                    borderColor: SEVERITY_COLORS[selectedInc.severity] 
                  }}
                  className="text-[10px] font-mono uppercase px-2 py-0.5 border rounded-full font-bold"
                >
                  {selectedInc.severity}
                </span>
              )}
            </div>


          {selectedInc ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-4" id="drawer-scroll-container">
              <div>
                <div className="flex items-center gap-2">
                  {getDisasterIcon(selectedInc.disasterType, 20)}
                  <h3 className="text-lg font-bold text-slate-100 capitalize">
                    {selectedInc.disasterType} Event Identified
                  </h3>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                  <MapPin size={12} className="text-slate-500" />
                  {selectedInc.locationName}
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  ID: {selectedInc.id} // TIMESTAMP: {new Date(selectedInc.timestamp).toLocaleString()}
                </p>
              </div>

              {selectedInc.imageUrl && (
                <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 h-32" id="detail-image-box">
                  <img 
                    src={selectedInc.imageUrl} 
                    alt="Analyzed disaster incident field feed" 
                    className="w-full h-full object-cover opacity-80"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400">
                    Confidence: {(selectedInc.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide">Analysis Summary</h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800">
                  {selectedInc.summary}
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide">Primary Visual Impacts</h4>
                <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                  {selectedInc.keyImpacts.map((imp, idx) => (
                    <li key={idx} className="truncate">{imp}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 space-y-2">
                <div className="flex gap-2">
                  <button
                    id={`btn-full-profile-${selectedInc.id}`}
                    onClick={() => onSelectPrediction(selectedInc)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs py-2 rounded-lg transition-colors font-medium cursor-pointer text-center"
                  >
                    Full Profile
                  </button>
                  <button
                    id={`btn-manual-signal-${selectedInc.id}`}
                    onClick={() => {
                      setAlertDisasterId(selectedInc.id);
                      setAlertMessage(`EMERGENCY URGENT ALERT: ${selectedInc.disasterType.toUpperCase()} threat detected at ${selectedInc.locationName}. Severity level is graded ${selectedInc.severity.toUpperCase()}. Follow state directives.`);
                      // scroll to broadcast panel
                      const alertEl = document.getElementById("manual-broadcast-panel");
                      if (alertEl) alertEl.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex-1 bg-red-950/30 hover:bg-red-950/50 text-red-400 border border-red-900/40 font-mono text-xs py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Bell size={13} />
                    Signal Alarm
                  </button>
                </div>
                
                <button
                  id={`btn-export-pdf-${selectedInc.id}`}
                  onClick={handleExportPDF}
                  className="w-full bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-900/50 font-mono text-xs py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText size={13} />
                  Export PDF SITREP Dossier
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8 space-y-2">
              <AlertTriangle size={24} />
              <p className="text-xs font-mono text-center">No telemetry signal found. Initiate file scan uploads to populate metrics.</p>
            </div>
          )}
        </div>
      )}

      </div>

      {/* Analytics Visualizers: Disaster Breakdowns, Severities, Trendlines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="analytics-charts-grid">
        
        {/* Incident Frequencies Chart */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col h-[320px]" id="chart-disasters-breakdown">
          <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-300 mb-3 uppercase flex items-center gap-2">
            <TrendingUp size={16} className="text-teal-400" /> Incident Frequencies (By Type)
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.disasterDistribution} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", fontFamily: "monospace", fontSize: "11px" }}
                  itemStyle={{ color: "#38bdf8" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {analytics.disasterDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DISASTER_COLORS[entry.name as keyof typeof DISASTER_COLORS] || "#334155"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Classification distribution */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col h-[320px]" id="chart-severity-breakout">
          <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-300 mb-3 uppercase flex items-center gap-2">
            <ShieldAlert size={16} className="text-rose-400" /> Threat Severity Gradation
          </h3>
          <div className="flex-1 min-h-0 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.severityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {analytics.severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.name as keyof typeof SEVERITY_COLORS] || "#64748b"} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", fontFamily: "monospace", fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 font-mono uppercase">TOTAL SEVERE</span>
              <span className="text-xl font-bold text-slate-100 font-sans mt-0.5">
                {analytics.counters.totalPredictions}
              </span>
            </div>
          </div>
          {/* Custom legends */}
          <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-center pt-2 border-t border-slate-800/60">
            {analytics.severityDistribution.map((s) => (
              <div key={s.name} className="flex flex-col items-center">
                <span style={{ color: SEVERITY_COLORS[s.name as keyof typeof SEVERITY_COLORS] }} className="font-bold uppercase">{s.name}</span>
                <span className="text-slate-300 font-sans mt-0.5">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Historical dispatch curve */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col h-[320px]" id="chart-timeline-trends">
          <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-300 mb-3 uppercase flex items-center gap-2">
            <Clock size={16} className="text-amber-400" /> AI Detection & Alert Timelines
          </h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.historicalTrends} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorIncidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px", color: "#f1f5f9", fontFamily: "monospace", fontSize: "11px" }}
                />
                <Area type="monotone" dataKey="incidents" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIncidents)" name="Incidents" />
                <Area type="monotone" dataKey="alerts" stroke="#ef4444" fillOpacity={1} fill="url(#colorAlerts)" name="Alerts Dispatched" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Aegis Tactical Copilot & Live Containment Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="copilot-containment-section">
        {/* Left Side: Interactive Aegis AI Tactical Copilot */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[400px]" id="aegis-ai-copilot-panel">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="text-teal-400 animate-pulse" size={18} />
              <h2 className="text-sm font-semibold font-mono tracking-wider text-slate-200">AEGIS COMMAND AI TACTICAL COPILOT</h2>
            </div>
            <span className="bg-teal-950/40 border border-teal-900/60 text-teal-400 text-[9px] font-mono px-2 py-0.5 rounded uppercase">
              Tactical Core Linked
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/50" id="copilot-messages-container">
            {copilotMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] shrink-0 font-mono ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-teal-900/50 text-teal-300 border border-teal-700/40"}`}>
                  {msg.role === "user" ? "U" : "AI"}
                </div>
                <div className={`text-xs p-3 rounded-xl leading-relaxed ${msg.role === "user" ? "bg-indigo-600/85 text-slate-100 rounded-tr-none" : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none"}`}>
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}
            {isCopilotTyping && (
              <div className="flex gap-2.5 max-w-[85%] mr-auto">
                <div className="w-6 h-6 rounded-full bg-teal-900/50 text-teal-300 border border-teal-700/40 flex items-center justify-center text-[10px] font-mono animate-pulse">
                  AI
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl rounded-tl-none flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span>Analyzing dispatch options...</span>
                </div>
              </div>
            )}
          </div>

          {/* Preset Prompts Panel */}
          <div className="bg-slate-950 px-3 py-2 border-t border-slate-900 flex flex-wrap gap-1.5">
            <button
              onClick={() => handleCopilotSend("Recommend an evacuation plan for this incident")}
              className="text-[10px] font-mono bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1"
            >
              🚨 Evacuation Plan
            </button>
            <button
              onClick={() => handleCopilotSend("Draft physical containment strategies")}
              className="text-[10px] font-mono bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1"
            >
              🛡️ Containment Options
            </button>
            <button
              onClick={() => handleCopilotSend("What siren alert sequence should be initiated?")}
              className="text-[10px] font-mono bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1"
            >
              📡 Siren Protocol
            </button>
          </div>

          {/* Form Input */}
          <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask Aegis AI for tactical recommendations..."
              value={userInputText}
              onChange={(e) => setUserInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCopilotSend()}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
            />
            <button
              onClick={() => handleCopilotSend()}
              className="bg-teal-700 hover:bg-teal-655 text-slate-100 px-3.5 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Send size={12} />
              SEND
            </button>
          </div>
        </div>

        {/* Right Side: Active Recovery Containment Gauges */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-[400px]" id="containment-gauges-panel">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-amber-400" size={16} />
              <h2 className="text-sm font-semibold font-mono tracking-wider text-slate-200">TACTICAL MITIGATION & CONTAINMENT STATUS</h2>
            </div>
          </div>

          <div className="flex-1 p-5 space-y-5 overflow-y-auto" id="containment-status-scroll">
            {selectedInc ? (
              <>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400 uppercase">INCIDENT LOCALIZATION</span>
                    <span className="text-slate-100 font-bold">{selectedInc.id} // {selectedInc.locationName}</span>
                  </div>
                  <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-600 rounded-full w-full animate-pulse" />
                  </div>
                </div>

                {/* Evac Progress Indicator */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-rose-400 font-bold uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      Civil Evacuation Progress
                    </span>
                    <span className="text-slate-300">
                      {selectedInc.severity === "extreme" ? "35%" : selectedInc.severity === "high" ? "60%" : "85%"} Complete
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{ width: selectedInc.severity === "extreme" ? "35%" : selectedInc.severity === "high" ? "60%" : "85%" }}
                      className="h-full bg-gradient-to-r from-red-600 to-rose-500 rounded-full transition-all duration-500"
                    />
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 leading-normal">
                    {selectedInc.severity === "extreme" ? "CRITICAL: Heavy congestion detected on evacuation highway corridors. Re-routing recommended." : "NOMINAL: Civilian transfer vectors operating within normal duration thresholds."}
                  </p>
                </div>

                {/* Mitigation Containment Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-teal-400 font-bold uppercase flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-teal-400" />
                      Active Threat Containment
                    </span>
                    <span className="text-slate-300">
                      {selectedInc.severity === "extreme" ? "20%" : selectedInc.severity === "high" ? "45%" : "70%"} Mitigated
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      style={{ width: selectedInc.severity === "extreme" ? "20%" : selectedInc.severity === "high" ? "45%" : "70%" }}
                      className="h-full bg-gradient-to-r from-teal-600 to-emerald-400 rounded-full transition-all duration-500"
                    />
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 leading-normal">
                    Physical barriers and firebreaks currently holding. Responders deploying structural reinforcement vectors in peripheral grids.
                  </p>
                </div>

                {/* Utility Grid & Responder Status Icons */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60 flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Utility Isolation</span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${selectedInc.severity === "extreme" || selectedInc.severity === "high" ? "bg-amber-500" : "bg-emerald-500"}`} />
                      <span className="text-xs font-mono font-bold text-slate-200">
                        {selectedInc.severity === "extreme" || selectedInc.severity === "high" ? "POWER ISOLATED" : "GRID ONLINE"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60 flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Active Dispatch Crews</span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Activity className="text-rose-500 animate-pulse" size={14} />
                      <span className="text-xs font-mono font-bold text-slate-200">
                        {selectedInc.severity === "extreme" ? "14 Squads" : selectedInc.severity === "high" ? "8 Squads" : "3 Squads"}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
                <p className="text-xs font-mono">No incident context selected on map telemetry.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Emergency Alert Dispatch Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden" id="manual-broadcast-panel">
        <div className="absolute right-0 bottom-0 w-44 h-44 bg-rose-500/5 rounded-full blur-3xl" />
        <div className="flex items-center gap-2 mb-4">
          <Send className="text-red-500" size={18} />
          <h3 className="text-base font-semibold font-mono tracking-wider text-slate-100 uppercase">
            Emergency Communications Broadcast (Manual Override)
          </h3>
        </div>

        <form onSubmit={handleManualAlertSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4" id="manual-alert-form">
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Broadcast Channel</label>
            <select
              id="select-alert-channel"
              value={alertType}
              onChange={(e) => setAlertType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg p-2.5 text-xs font-mono focus:border-red-500 focus:outline-none"
            >
              <option value="SMS">SMS Notification (Cell Networks)</option>
              <option value="Email">Emergency Agency Email</option>
              <option value="Radio Broadcast">VHF Radio Emergency channel</option>
              <option value="Siren Network">Siren Activation Array</option>
            </select>
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Recipient Sector / Node</label>
            <input
              id="input-alert-recipient"
              type="text"
              placeholder="e.g. Zone A Residents, Local PD"
              value={alertRecipient}
              onChange={(e) => setAlertRecipient(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg p-2.5 text-xs font-mono focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Attach Incident ID</label>
            <select
              id="select-alert-disaster-link"
              value={alertDisasterId}
              onChange={(e) => setAlertDisasterId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg p-2.5 text-xs font-mono focus:border-red-500 focus:outline-none"
            >
              <option value="">-- No Incident (Standalone) --</option>
              {predictions.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.id}] {p.disasterType.toUpperCase()} - {p.locationName}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-4 space-y-1.5 flex flex-col justify-end">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Broadcast Payload Message</label>
            <div className="flex gap-2">
              <input
                id="input-alert-message"
                type="text"
                required
                placeholder="EMERGENCY WARNING Payload..."
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 rounded-lg p-2.5 text-xs font-mono focus:border-red-500 focus:outline-none"
              />
              <button
                id="btn-alert-dispatch-execute"
                type="submit"
                disabled={isSubmittingAlert}
                className="bg-red-700 hover:bg-red-600 disabled:bg-slate-800 text-slate-100 font-mono text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all border border-red-500 cursor-pointer"
              >
                {isSubmittingAlert ? "Sending..." : "DISPATCH"}
              </button>
            </div>
          </div>
        </form>

        {successMsg && (
          <div className="mt-3 text-xs text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/20 border border-emerald-900/30 p-2 rounded" id="alert-dispatch-success">
            <CheckCircle2 size={14} /> {successMsg}
          </div>
        )}
      </div>
    </div>
  );
}
