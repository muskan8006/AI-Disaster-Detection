import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  Flame, 
  Waves, 
  Activity, 
  Wind, 
  Mountain, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  MapPin, 
  ShieldAlert, 
  Bell, 
  FileText, 
  ArrowRight,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { PredictionRecord } from "../types";

interface DetectionScannerProps {
  onPredictionComplete: (prediction: PredictionRecord) => void;
}

export default function DetectionScanner({ onPredictionComplete }: DetectionScannerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentScanResult, setCurrentScanResult] = useState<PredictionRecord | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<"standard" | "thermal">("thermal");
  
  // States for report and alert simulation within scanner
  const [isAlertBroadcasting, setIsAlertBroadcasting] = useState(false);
  const [alertBroadcastSuccess, setAlertBroadcastSuccess] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportSuccessText, setReportSuccessText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Diagnostic sub-messages to show during analysis
  const diagnosticSteps = [
    "Reading raster image channels & verifying metadata...",
    "Extracting multi-spectral luminance features & edge parameters...",
    "Querying multi-modal model for environmental anomalies...",
    "Evaluating thermal, geological, and meteorological variables...",
    "Generating structural hazard assessments and field instructions..."
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Unsupported file type. Please upload a PNG, JPEG, or WEBP image.");
      return;
    }

    setErrorMessage("");
    setCurrentScanResult(null);
    setAlertBroadcastSuccess(false);
    setReportSuccessText("");

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      setUploadedImageUrl(base64Data);
      await triggerModelPrediction(base64Data, file.name);
    };
    reader.onerror = () => {
      setErrorMessage("Error occurred while reading file. Try another image.");
    };
    reader.readAsDataURL(file);
  };

  const triggerModelPrediction = async (imageBase64: string, filename: string) => {
    setIsProcessing(true);
    setProcessingStep(0);

    // Stagger diagnostic messages visually
    const interval = setInterval(() => {
      setProcessingStep((prev) => {
        if (prev < diagnosticSteps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1200);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, filename }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error status: ${response.status}`);
      }

      const result: PredictionRecord = await response.json();
      
      // Delay final completion slightly to let user see high-fidelity logs
      setTimeout(() => {
        clearInterval(interval);
        setIsProcessing(false);
        setCurrentScanResult(result);
        onPredictionComplete(result);
      }, 1500);

    } catch (err: any) {
      clearInterval(interval);
      setIsProcessing(false);
      setErrorMessage(err.message || "An error occurred while connecting to the backend prediction API.");
    }
  };

  const handleBroadcastAlertFromScan = async () => {
    if (!currentScanResult) return;
    setIsAlertBroadcasting(true);
    try {
      const response = await fetch("/api/alerts/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disasterId: currentScanResult.id,
          type: "SMS",
          recipient: `${currentScanResult.locationName} Resident Broadcaster`,
          message: `CRITICAL SYSTEM WARNING: Active ${currentScanResult.disasterType.toUpperCase()} identified at ${currentScanResult.locationName}. Severity grading is ${currentScanResult.severity.toUpperCase()}. Prepare for containment directives.`
        })
      });

      if (response.ok) {
        setAlertBroadcastSuccess(true);
        // update memory item
        currentScanResult.alertBroadcasted = true;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAlertBroadcasting(false);
    }
  };

  const handleGenerateReportFromScan = async () => {
    if (!currentScanResult) return;
    setIsGeneratingReport(true);
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disasterId: currentScanResult.id,
          title: `AI_FIELD_SITREP_${currentScanResult.disasterType.toUpperCase()}_${currentScanResult.id}`
        })
      });

      if (response.ok) {
        setReportSuccessText("Official Incident Situation Report compiled successfully and filed in Incident Reports database.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getDisasterStyles = (type: string) => {
    switch (type) {
      case "wildfire": return { icon: <Flame size={28} className="text-red-500" />, border: "border-red-900/65", bg: "bg-red-950/20", glow: "shadow-red-500/20" };
      case "flood": return { icon: <Waves size={28} className="text-blue-500" />, border: "border-blue-900/65", bg: "bg-blue-950/20", glow: "shadow-blue-500/20" };
      case "earthquake": return { icon: <Activity size={28} className="text-purple-500" />, border: "border-purple-900/65", bg: "bg-purple-950/20", glow: "shadow-purple-500/20" };
      case "cyclone": return { icon: <Wind size={28} className="text-teal-500" />, border: "border-teal-900/65", bg: "bg-teal-950/20", glow: "shadow-teal-500/20" };
      case "landslide": return { icon: <Mountain size={28} className="text-amber-800" />, border: "border-amber-900/65", bg: "bg-amber-950/20", glow: "shadow-amber-500/20" };
      default: return { icon: <CheckCircle2 size={28} className="text-green-500" />, border: "border-green-900/65", bg: "bg-green-950/20", glow: "shadow-green-500/20" };
    }
  };

  const SEVERITY_BADGES = {
    low: "bg-emerald-950/50 text-emerald-400 border-emerald-900/40",
    medium: "bg-amber-950/50 text-amber-400 border-amber-900/40",
    high: "bg-orange-950/50 text-orange-400 border-orange-900/40",
    extreme: "bg-red-950/50 text-red-400 border-red-900/40",
  };

  return (
    <div className="space-y-6" id="detection-scanner-container">
      
      {/* UAV Drone Active Telemetry Surveillance Cam */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl" id="uav-surveillance-feed-container">
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-[pulse_1s_infinite]" />
            <h2 className="text-sm font-semibold font-mono tracking-wider text-slate-200">LIVE SURVEILLANCE FEED: UAV PILOT #AEGIS-9</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-mono">LENS FILTER:</span>
            <button
              onClick={() => setCameraMode("standard")}
              className={`text-[9px] font-mono px-2 py-0.5 rounded cursor-pointer ${cameraMode === "standard" ? "bg-teal-700 text-white font-bold" : "bg-slate-950 text-slate-400 hover:text-slate-200"}`}
            >
              VISUAL
            </button>
            <button
              onClick={() => setCameraMode("thermal")}
              className={`text-[9px] font-mono px-2 py-0.5 rounded cursor-pointer ${cameraMode === "thermal" ? "bg-red-700 text-white font-bold" : "bg-slate-950 text-slate-400 hover:text-slate-200"}`}
            >
              THERMAL / FLIR
            </button>
          </div>
        </div>

        <div className="relative h-64 bg-slate-950/90 overflow-hidden flex items-center justify-center" id="drone-active-camera">
          {cameraMode === "thermal" ? (
            /* Thermal visual theme overlay representation */
            <div className="absolute inset-0 bg-blue-950/40 mix-blend-color-burn pointer-events-none">
              {/* Dynamic Heat Zones mock rendering */}
              <div className="absolute w-24 h-24 bg-red-600/35 blur-3xl rounded-full top-1/4 left-1/3 animate-pulse" />
              <div className="absolute w-36 h-36 bg-orange-500/25 blur-3xl rounded-full bottom-1/4 right-1/4 animate-pulse" />
              <div className="absolute w-12 h-12 bg-yellow-400/35 blur-2xl rounded-full top-1/2 left-2/3 animate-pulse" />
            </div>
          ) : (
            /* Standard visual stream */
            <div className="absolute inset-0 bg-emerald-950/10 pointer-events-none" />
          )}

          {/* Grid target scope scanning animation */}
          <div className="absolute inset-0 border border-slate-800/40 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />
          
          {/* Target reticle */}
          <div className="absolute w-24 h-24 border border-teal-500/40 rounded-full animate-[spin_10s_linear_infinite] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
            <div className="absolute top-0 w-full h-[1px] bg-teal-500/40" />
            <div className="absolute left-0 h-full w-[1px] bg-teal-500/40" />
          </div>

          <div className="absolute top-4 left-4 font-mono text-[10px] text-teal-400 bg-slate-950/80 backdrop-blur-md p-2.5 rounded border border-slate-800/80 space-y-0.5">
            <p className="text-white font-bold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" /> Telemetry Synced
            </p>
            <p>ALT: 1,480 Meters</p>
            <p>SPD: 44.5 knots</p>
            <p>ZOOM: EO 4.0X OPTICAL</p>
          </div>

          <div className="absolute bottom-4 right-4 font-mono text-[10px] text-teal-400 bg-slate-950/80 backdrop-blur-md p-2.5 rounded border border-slate-800/80 space-y-0.5 text-right">
            <p>HD CAMERA LINK // ACTIVE</p>
            <p>GPS POS: 34°03'07.9"N 118°14'37.3"W</p>
            <p className="text-red-500 animate-pulse font-bold">● REC [HD STREAM]</p>
          </div>

          {/* Scrolling visual scan sweep line */}
          <div className="absolute w-full h-0.5 bg-teal-400/50 shadow-[0_0_10px_#2dd4bf] animate-[bounce_4s_infinite]" />

          {/* Center Title overlay */}
          <div className="text-center z-10 select-none pointer-events-none">
            <p className="text-[11px] font-mono tracking-widest text-teal-400 font-bold uppercase">AEGIS TACTICAL UAV SURVEY</p>
            <p className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">Continuous multispectral environmental raster sweep</p>
          </div>
        </div>
      </div>

      {/* Upload & Loading Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="scanner-controls-grid">
        
        {/* Upload Sandbox */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between" id="upload-sandbox-card">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-1.5">
              <Sparkles size={16} className="text-teal-400" /> Imagery Analytical Portal
            </h2>
            <p className="text-xs text-slate-400">
              Upload aerial drone footage, ground-level imagery, or sensor pictures. The neural classifier uses localized contextual tags to identify active disasters in real-time.
            </p>
          </div>

          <form
            id="drag-drop-form"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onSubmit={(e) => e.preventDefault()}
            className={`mt-4 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer h-56 ${
              dragActive 
                ? "border-red-500 bg-red-950/5" 
                : "border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-950/80"
            }`}
            onClick={onButtonClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              id="scanner-image-file-input"
              multiple={false}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-full text-slate-400 mb-3" id="icon-upload-container">
              <UploadCloud size={32} className="text-slate-300" />
            </div>
            <p className="text-xs font-mono font-medium text-slate-200 text-center">
              DRAG & DROP IMAGERY HERE OR <span className="text-teal-400 font-bold underline">BROWSE</span>
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-1 text-center">
              PNG, JPG, WEBP formats supported (Maximum 20MB)
            </p>
          </form>

          {/* Quick Presets for Immediate Testing */}
          <div className="mt-4 pt-3 border-t border-slate-800/60" id="presets-panel">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">Test Presets (Instant AI Classification):</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const mockUrl = "https://images.unsplash.com/photo-1508873696983-2df519f0397e?auto=format&fit=crop&w=600&q=80"; // Wildfire image placeholder
                  setUploadedImageUrl(mockUrl);
                  triggerModelPrediction(mockUrl, "wildfire_incident_uav_sector_4.jpg");
                }}
                className="bg-slate-950 hover:bg-slate-850 text-slate-100 text-[10px] font-mono border border-slate-800 p-2 rounded text-center cursor-pointer transition-colors"
              >
                🔥 Wildfire
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const mockUrl = "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?auto=format&fit=crop&w=600&q=80"; // Flood image placeholder
                  setUploadedImageUrl(mockUrl);
                  triggerModelPrediction(mockUrl, "coastal_flood_scout_delta.jpg");
                }}
                className="bg-slate-950 hover:bg-slate-850 text-slate-100 text-[10px] font-mono border border-slate-800 p-2 rounded text-center cursor-pointer transition-colors"
              >
                🌊 Flood
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const mockUrl = "https://images.unsplash.com/photo-1594897030264-ab7d87efc473?auto=format&fit=crop&w=600&q=80"; // Rubble placeholder
                  setUploadedImageUrl(mockUrl);
                  triggerModelPrediction(mockUrl, "displacement_rubble_sector_11.jpg");
                }}
                className="bg-slate-950 hover:bg-slate-850 text-slate-100 text-[10px] font-mono border border-slate-800 p-2 rounded text-center cursor-pointer transition-colors"
              >
                🌋 Earthquake
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-3 bg-red-950/30 border border-red-900/30 p-2.5 rounded text-xs font-mono text-red-400 flex items-center gap-1.5" id="scanner-error-message">
              <AlertTriangle size={14} /> {errorMessage}
            </div>
          )}
        </div>

        {/* Real-time Processing Logs or Diagnostic Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between" id="diagnostic-panel-card">
          <div className="space-y-1.5">
            <h2 className="text-sm font-semibold font-mono tracking-wider text-slate-200 uppercase">
              SCANNING GRAPH & LOG DIAGNOSTICS
            </h2>
            <p className="text-xs text-slate-500 font-mono">CHANNEL RECOVERY STATUS: SAFE</p>
          </div>

          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3.5 font-mono text-xs text-slate-400 space-y-2.5 mt-4 min-h-[140px] overflow-y-auto" id="diagnostic-log-drawer">
            {isProcessing ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-teal-400 font-bold">
                  <Loader2 className="animate-spin" size={14} />
                  <span>AI PROCESSING CHANNELS IN PROGRESS...</span>
                </div>
                <div className="space-y-1 text-[10px] pl-5">
                  {diagnosticSteps.slice(0, processingStep + 1).map((step, idx) => (
                    <p key={idx} className="text-slate-300 flex items-center gap-1">
                      <span className="text-emerald-500">✓</span> {step}
                    </p>
                  ))}
                  {processingStep < diagnosticSteps.length - 1 && (
                    <p className="text-teal-400/80 animate-pulse flex items-center gap-1 pl-4">
                      <span>■</span> {diagnosticSteps[processingStep + 1]}
                    </p>
                  )}
                </div>
              </div>
            ) : uploadedImageUrl ? (
              <div className="space-y-2 text-[11px]" id="diagnostic-upload-complete">
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 size={13} />
                  <span>IMAGE CHANNELS ACQUIRED SUCCESSFULLY</span>
                </div>
                <p className="text-slate-400 pl-4">Size: Verification Completed // Format: RGB Channels Verified</p>
                {currentScanResult ? (
                  <div className="pl-4 space-y-1 border-l border-slate-800 mt-2">
                    <p className="text-slate-300 font-bold uppercase">Classification Results:</p>
                    <p className="text-slate-400">Class: <span className="text-white capitalize">{currentScanResult.disasterType}</span></p>
                    <p className="text-slate-400">Confidence: <span className="text-teal-400 font-bold">{(currentScanResult.confidence * 100).toFixed(1)}%</span></p>
                    <p className="text-slate-400">Severity: <span className="text-rose-400 font-bold uppercase">{currentScanResult.severity}</span></p>
                  </div>
                ) : (
                  <p className="text-slate-500 pl-4 animate-pulse">Computing classification models...</p>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-6 space-y-1.5" id="diagnostic-empty">
                <RefreshCw size={24} className="opacity-40 animate-spin-slow" />
                <p className="text-[11px] font-mono text-center">Awaiting imagery upload to compile neural statistics...</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/60 mt-4 flex justify-between items-center text-[10px] font-mono text-slate-500">
            <span>PLATFORM: EXPRESS + GEMINI PRO CORE</span>
            <span className="text-emerald-500">READY</span>
          </div>
        </div>

      </div>

      {/* Prediction Result Panel */}
      {currentScanResult && (
        <div 
          className={`bg-slate-900 border ${getDisasterStyles(currentScanResult.disasterType).border} rounded-xl p-6 shadow-2xl transition-all duration-300 relative overflow-hidden`}
          id={`scan-result-card-${currentScanResult.id}`}
        >
          {/* Subtle backdrop glow */}
          <div className={`absolute top-0 right-0 w-64 h-64 opacity-5 blur-3xl rounded-full ${getDisasterStyles(currentScanResult.disasterType).glow}`} />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800/60 gap-4" id="scan-result-header">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                {getDisasterStyles(currentScanResult.disasterType).icon}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold font-sans text-slate-100 capitalize">
                    {currentScanResult.disasterType} Detected
                  </h3>
                  <span className={`text-xs font-mono font-bold uppercase px-2.5 py-0.5 border rounded-full ${SEVERITY_BADGES[currentScanResult.severity]}`}>
                    {currentScanResult.severity} Severity
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono flex items-center gap-1">
                  <MapPin size={12} className="text-slate-500" />
                  Location: {currentScanResult.locationName}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end md:text-right" id="confidence-scoring-panel">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Model Integrity Score</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-24 bg-slate-950 border border-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" 
                    style={{ width: `${currentScanResult.confidence * 100}%` }}
                  />
                </div>
                <span className="text-base font-mono font-bold text-teal-400">
                  {(currentScanResult.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6" id="scan-result-body">
            
            {/* Visual description */}
            <div className="md:col-span-8 space-y-4">
              <div className="space-y-1.5">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide">Scene Analysis Summary</h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  {currentScanResult.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
                    <ShieldAlert size={14} className="text-red-500" /> Key Environmental Impacts
                  </h4>
                  <ul className="text-xs text-slate-400 space-y-1.5 pl-4 list-disc">
                    {currentScanResult.keyImpacts.map((imp, idx) => (
                      <li key={idx} className="leading-normal">{imp}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl space-y-2">
                  <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
                    <CheckCircle2 size={14} className="text-emerald-500" /> Immediate Tactical Directives
                  </h4>
                  <ul className="text-xs text-slate-400 space-y-1.5 pl-4 list-disc">
                    {currentScanResult.recommendedActions.map((act, idx) => (
                      <li key={idx} className="leading-normal">{act}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Geographical details & operations */}
            <div className="md:col-span-4 space-y-4">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3" id="geotech-data-card">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide">Geotechnical Signatures</h4>
                
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-900 border border-slate-800/80 p-2.5 rounded">
                    <span className="text-[10px] text-slate-500 block">LATITUDE</span>
                    <span className="text-slate-200 mt-0.5 block">{currentScanResult.coordinates.lat.toFixed(4)}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800/80 p-2.5 rounded">
                    <span className="text-[10px] text-slate-500 block">LONGITUDE</span>
                    <span className="text-slate-200 mt-0.5 block">{currentScanResult.coordinates.lng.toFixed(4)}</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800/80 p-2.5 rounded text-xs font-mono">
                  <span className="text-[10px] text-slate-500 block">AFFECTED REGION SCALE</span>
                  <span className="text-slate-200 mt-0.5 block">{currentScanResult.affectedAreaEstimate}</span>
                </div>
              </div>

              {/* Responder operations sandbox */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3" id="operational-triggers-card">
                <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wide">Emergency Actions</h4>
                
                <div className="space-y-2">
                  <button
                    id="btn-broadcast-scan-alert"
                    onClick={handleBroadcastAlertFromScan}
                    disabled={isAlertBroadcasting || currentScanResult.alertBroadcasted}
                    className="w-full bg-red-900 hover:bg-red-800 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-transparent text-slate-100 font-mono text-xs py-2.5 rounded-lg font-bold border border-red-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Bell size={14} />
                    {currentScanResult.alertBroadcasted 
                      ? "BROADCAST COMPLETED" 
                      : isAlertBroadcasting 
                        ? "DISPATCHING..." 
                        : "BROADCAST CELL WARNING"}
                  </button>

                  <button
                    id="btn-generate-scan-report"
                    onClick={handleGenerateReportFromScan}
                    disabled={isGeneratingReport || !!reportSuccessText}
                    className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-500 disabled:border-transparent text-slate-200 font-mono text-xs py-2.5 rounded-lg font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileText size={14} />
                    {isGeneratingReport ? "CREATING REPORT..." : reportSuccessText ? "REPORT STORED" : "COMPILE SITUATION REPORT"}
                  </button>
                </div>

                {alertBroadcastSuccess && (
                  <p className="text-[10px] font-mono text-emerald-400 text-center animate-pulse" id="scan-alert-success">
                    ✓ Cell broadcast dispatched to targeted residential cells.
                  </p>
                )}

                {reportSuccessText && (
                  <p className="text-[10px] font-mono text-emerald-400 text-center animate-pulse" id="scan-report-success">
                    ✓ Report added to database folders.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
