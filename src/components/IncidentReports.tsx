import React, { useState } from "react";
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Copy, 
  Check, 
  Clock, 
  AlertTriangle,
  Building,
  MapPin,
  Calendar
} from "lucide-react";
import { ReportRecord, PredictionRecord } from "../types";

interface IncidentReportsProps {
  reports: ReportRecord[];
  predictions: PredictionRecord[];
  onGenerateReport: (disasterId: string, title?: string) => void;
}

export default function IncidentReports({ reports, predictions, onGenerateReport }: IncidentReportsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(
    reports.length > 0 ? reports[0].id : null
  );

  // Form States to generate report
  const [disasterIdForReport, setDisasterIdForReport] = useState("");
  const [customReportTitle, setCustomReportTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreateReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disasterIdForReport) return;

    setIsGenerating(true);
    setTimeout(() => {
      onGenerateReport(disasterIdForReport, customReportTitle);
      setIsGenerating(false);
      setCustomReportTitle("");
      setDisasterIdForReport("");
      setFormSuccess("Situation report compiled and stored in ledger.");
      setTimeout(() => setFormSuccess(""), 3000);
    }, 1000);
  };

  const handleCopyText = (text: string, reportId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(reportId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadMockPDF = (report: ReportRecord) => {
    // Generate simple text download as SITREP mockup
    const element = document.createElement("a");
    const file = new Blob([report.content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${report.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const filteredReports = reports.filter((report) => 
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.disasterType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  return (
    <div className="space-y-6" id="incident-reports-container">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="reports-layout-grid">
        
        {/* Left Drawer: Reports Catalogue */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col h-[520px]" id="reports-catalogue">
          <div className="pb-3 border-b border-slate-800/60 flex justify-between items-center">
            <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-100 uppercase">
              SITREP CATALOGUE
            </h3>
            <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 border border-slate-800 rounded text-slate-400">
              LEDGER: {reports.length}
            </span>
          </div>

          <div className="relative py-3" id="search-reports-bar">
            <Search className="absolute left-3 top-5.5 text-slate-500" size={14} />
            <input
              id="input-search-reports"
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono focus:border-red-500 focus:outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1" id="reports-list-drawer">
            {filteredReports.map((rep) => {
              const isSelected = rep.id === selectedReportId || (rep.id === activeReport?.id);
              return (
                <button
                  key={rep.id}
                  id={`btn-select-report-${rep.id}`}
                  onClick={() => setSelectedReportId(rep.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col space-y-1.5 focus:outline-none ${
                    isSelected 
                      ? "bg-slate-950 border-teal-500/80 shadow-md shadow-teal-500/5" 
                      : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-slate-500">REF: {rep.id}</span>
                    <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(rep.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs font-mono font-bold text-slate-200 truncate">
                    {rep.title}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400 capitalize">DISASTER: {rep.disasterType}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${
                      rep.severity.toLowerCase() === "extreme" ? "text-red-400 border-red-950/60 bg-red-950/20" :
                      rep.severity.toLowerCase() === "high" ? "text-orange-400 border-orange-950/60 bg-orange-950/20" :
                      "text-amber-400 border-amber-950/60 bg-amber-950/20"
                    }`}>
                      {rep.severity}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center/Right Panel: Situation Report Detail Viewer */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-[520px]" id="report-detail-viewer">
          {activeReport ? (
            <div className="flex-1 flex flex-col justify-between h-full" id="active-report-full-view">
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/60 gap-4">
                  <div>
                    <h2 className="text-sm font-semibold font-mono tracking-wider text-teal-400 uppercase">
                      OFFICIAL AI FIELD SITREP
                    </h2>
                    <h3 className="text-base font-bold font-mono text-slate-100 mt-1">
                      {activeReport.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="btn-copy-report-payload"
                      onClick={() => handleCopyText(activeReport.content, activeReport.id)}
                      className="bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 font-mono text-[10px] px-2.5 py-1.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedId === activeReport.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copiedId === activeReport.id ? "COPIED" : "COPY PAYLOAD"}
                    </button>
                    
                    <button
                      id="btn-download-report-txt"
                      onClick={() => handleDownloadMockPDF(activeReport)}
                      className="bg-teal-950/30 hover:bg-teal-950/50 text-teal-400 border border-teal-900/40 font-mono text-[10px] px-2.5 py-1.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Download size={12} />
                      DOWNLOAD REPORT
                    </button>
                  </div>
                </div>

                {/* Report Content Panel */}
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-text h-[280px] overflow-y-auto" id="report-document-body">
                  {activeReport.content}
                </div>
              </div>

              {/* Form trigger to generate a report from historical feeds */}
              <div className="pt-4 border-t border-slate-800/60 mt-4 bg-slate-950/30 p-3.5 rounded-lg border border-slate-850/55" id="report-generator-trigger-panel">
                <form onSubmit={handleCreateReportSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3" id="compile-report-form">
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Select Target Incident Feed</label>
                    <select
                      id="report-target-disaster"
                      required
                      value={disasterIdForReport}
                      onChange={(e) => setDisasterIdForReport(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg p-2 text-xs font-mono focus:border-teal-500 focus:outline-none"
                    >
                      <option value="">-- Choose Incident ID --</option>
                      {predictions.map((p) => (
                        <option key={p.id} value={p.id}>
                          [{p.id}] {p.disasterType.toUpperCase()} - {p.locationName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-5 space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Custom Title Label (Optional)</label>
                    <input
                      id="report-custom-title-label"
                      type="text"
                      placeholder="e.g. DRAFT_WILDFIRE_RIDGE"
                      value={customReportTitle}
                      onChange={(e) => setCustomReportTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg p-2 text-xs font-mono focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-3 flex flex-col justify-end">
                    <button
                      id="btn-execute-report-compiling"
                      type="submit"
                      disabled={isGenerating || !disasterIdForReport}
                      className="w-full bg-teal-800 hover:bg-teal-700 disabled:bg-slate-800 text-white font-mono text-xs py-2 rounded-lg font-bold border border-teal-500 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus size={14} />
                      {isGenerating ? "COMPILING..." : "COMPILE SITREP"}
                    </button>
                  </div>
                </form>

                {formSuccess && (
                  <p className="text-[10px] text-emerald-400 font-mono mt-2 animate-pulse text-center" id="compile-report-success-msg">
                    ✓ {formSuccess}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2 py-12" id="reports-view-empty">
              <FileText size={32} className="opacity-40 animate-pulse" />
              <p className="text-xs font-mono text-center">No reports compiled in current ledger. Run Scan classifications to create documents.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
