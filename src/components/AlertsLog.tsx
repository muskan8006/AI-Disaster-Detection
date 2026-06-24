import React, { useState } from "react";
import { 
  Bell, 
  Send, 
  Search, 
  Filter, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  AlertOctagon,
  Radio,
  Mail,
  Smartphone
} from "lucide-react";
import { AlertRecord } from "../types";

interface AlertsLogProps {
  alerts: AlertRecord[];
  onTriggerAlert: (alertData: { disasterId?: string; type: any; recipient: string; message: string }) => void;
}

export default function AlertsLog({ alerts, onTriggerAlert }: AlertsLogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Manual Trigger Form States
  const [customType, setCustomType] = useState<"SMS" | "Email" | "Radio Broadcast" | "Siren Network">("SMS");
  const [customRecipient, setCustomRecipient] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const handleManualTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage) return;

    setIsSending(true);
    setTimeout(() => {
      onTriggerAlert({
        type: customType,
        recipient: customRecipient || "All Localized Cells",
        message: customMessage,
      });
      setIsSending(false);
      setCustomMessage("");
      setCustomRecipient("");
      setToastMsg("Emergency signal broadcast completed.");
      setTimeout(() => setToastMsg(""), 3000);
    }, 800);
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "SMS":
        return <Smartphone size={14} className="text-teal-400" />;
      case "Email":
        return <Mail size={14} className="text-blue-400" />;
      case "Radio Broadcast":
        return <Radio size={14} className="text-amber-400" />;
      default:
        return <Bell size={14} className="text-rose-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-950/40 text-emerald-400 border-emerald-900/30";
      case "Sent":
        return "bg-blue-950/40 text-blue-400 border-blue-900/30";
      default:
        return "bg-red-950/40 text-red-400 border-red-900/30";
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = 
      alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.disasterType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "ALL" || alert.type === filterType;
    const matchesStatus = filterStatus === "ALL" || alert.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6" id="alerts-log-container">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="alerts-layout-grid">
        
        {/* Left Side: Broadcast History logs */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-[540px]" id="alerts-history-box">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/60 gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold font-mono tracking-wider text-slate-100 uppercase flex items-center gap-1.5">
                <Radio size={16} className="text-rose-500 animate-pulse" /> Emergency Communications Log
              </h2>
              <p className="text-xs text-slate-400">Review, verify and audit dispatched civil defense alarms and automated warning feeds.</p>
            </div>
            <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg text-slate-400">
              Dispatched Total: {alerts.length}
            </span>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 border-b border-slate-800/40" id="alerts-filter-row">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={15} />
              <input
                id="search-alerts"
                type="text"
                placeholder="Search messages, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg pl-9 pr-3 py-2 text-xs font-mono focus:border-red-500 focus:outline-none"
              />
            </div>

            <div>
              <select
                id="filter-alert-channel"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg p-2 text-xs font-mono focus:border-red-500 focus:outline-none"
              >
                <option value="ALL">Channel: All</option>
                <option value="SMS">SMS Cell Networks</option>
                <option value="Email">Emergency Agency Email</option>
                <option value="Radio Broadcast">Radio Broadcast</option>
                <option value="Siren Network">Siren Network</option>
              </select>
            </div>

            <div>
              <select
                id="filter-alert-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg p-2 text-xs font-mono focus:border-red-500 focus:outline-none"
              >
                <option value="ALL">Status: All</option>
                <option value="Delivered">Delivered</option>
                <option value="Sent">Sent</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Logs List Container */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pt-4 pr-1" id="alerts-list-drawer">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  id={`alert-log-card-${alert.id}`}
                  className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl hover:border-slate-700 transition-colors flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5 text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                      {getChannelIcon(alert.type)}
                      <span>{alert.type}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">ID: {alert.id}</span>
                      <span className="text-slate-500">//</span>
                      <span className="text-slate-400 font-bold capitalize">Disaster: {alert.disasterType}</span>
                      <span className="text-slate-500">//</span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-normal font-mono bg-slate-900/40 p-2 rounded border border-slate-800/40">
                    {alert.message}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono border-t border-slate-900/60 pt-2">
                    <span className="text-slate-400">Recipient Node: <span className="text-slate-300">{alert.recipient}</span></span>
                    <span className={`px-2 py-0.5 rounded border ${getStatusBadge(alert.status)}`}>
                      {alert.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-10" id="alerts-list-empty">
                <AlertOctagon size={24} className="opacity-40" />
                <p className="text-xs font-mono text-center">No alerts match search parameters or filter classifications.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Override Alert Simulator Form */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between h-[540px]" id="alerts-simulator-box">
          <div className="space-y-1.5 pb-4 border-b border-slate-800/60">
            <h2 className="text-sm font-semibold font-mono tracking-wider text-slate-100 uppercase flex items-center gap-1.5">
              <AlertTriangle size={15} className="text-red-500" /> Dispatch Control Unit
            </h2>
            <p className="text-xs text-slate-400">Configure manually injected payload sirens, broad warnings, or first responder bulletins.</p>
          </div>

          <form onSubmit={handleManualTrigger} className="flex-1 py-4 space-y-4" id="alerts-simulator-form">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Broadcast Channel</label>
              <select
                id="simulator-alert-channel"
                value={customType}
                onChange={(e) => setCustomType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg p-2.5 text-xs font-mono focus:border-red-500 focus:outline-none"
              >
                <option value="SMS">SMS Broadcast (Cellular System)</option>
                <option value="Email">Emergency Agency Email</option>
                <option value="Radio Broadcast">Radio VHF Frequency Band</option>
                <option value="Siren Network">Siren Network Activation</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Target Recipient Node</label>
              <input
                id="simulator-alert-recipient"
                type="text"
                placeholder="e.g. Zone A Coastal Sector"
                required
                value={customRecipient}
                onChange={(e) => setCustomRecipient(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg p-2.5 text-xs font-mono focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 flex-1 flex flex-col">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Payload Threat Warning Message</label>
              <textarea
                id="simulator-alert-message"
                placeholder="ALERT: State-wide emergency warnings in progress. Evacuate targeted structures..."
                required
                rows={5}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full flex-1 bg-slate-950 border border-slate-800 text-slate-100 rounded-lg p-2.5 text-xs font-mono focus:border-red-500 focus:outline-none resize-none"
              />
            </div>

            <button
              id="btn-simulator-alert-dispatch"
              type="submit"
              disabled={isSending}
              className="w-full bg-red-800 hover:bg-red-700 text-white font-mono text-xs py-3 rounded-lg font-bold border border-red-500 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send size={14} />
              {isSending ? "BROADCASTING CHANNELS..." : "DISPATCH BROADCAST OVERRIDE"}
            </button>
          </form>

          {toastMsg && (
            <div className="mt-3 text-xs text-emerald-400 font-mono flex items-center gap-1 bg-emerald-950/20 border border-emerald-900/30 p-2 rounded justify-center" id="simulator-toast-success">
              <CheckCircle2 size={14} /> {toastMsg}
            </div>
          )}

          <div className="pt-3 border-t border-slate-800/60 flex justify-between items-center text-[9px] font-mono text-slate-500">
            <span>UNIT INTEGRITY: OPERATIONAL</span>
            <span className="text-emerald-500">READY</span>
          </div>
        </div>

      </div>
    </div>
  );
}
