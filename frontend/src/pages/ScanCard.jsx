import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import toast from "react-hot-toast";
import { Wifi, CheckCircle, ChevronRight, CreditCard } from "lucide-react";

const DEMO_CARDS = [
  { id:"NFC-001", name:"Arjun Mehta",  info:"45y · B+ · Diabetes, Hypertension" },
  { id:"NFC-002", name:"Priya Sharma", info:"32y · O+ · Asthma" },
];

export default function ScanCard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [input, setInput]     = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult]   = useState(null);

  const scan = async (id) => {
    const cardId = id || input.trim();
    if (!cardId) return toast.error("Enter a card ID");
    setScanning(true); setResult(null);
    try {
      const { data } = await api.get(`/scan/${cardId}`);
      setResult({ nfcCardId: data.nfcCardId, patientName: data.patientName });
      setInput(data.nfcCardId);
      toast.success(`Card found: ${data.patientName}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Card not found");
    } finally { setScanning(false); }
  };

  const accessOptions = [
    { key:"emergency",       label:"🚨 Emergency Access",  desc:"No OTP — instant",     roles:["admin","doctor","pharmacist","lab_technician"] },
    { key:"patient-details", label:"👤 Patient Details",   desc:"OTP required",          roles:["admin","doctor"] },
    { key:"reports",         label:"🧪 Test & Reports",    desc:"OTP required",          roles:["admin","doctor","lab_technician"] },
    { key:"pharmacy",        label:"💊 Pharmacy Access",   desc:"License + OTP",         roles:["pharmacist"] },
  ].filter(o => o.roles.includes(user?.role));

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-1">NFC Card Scanner</h1>
      <p className="text-sm text-gray-500 mb-5">Simulate tapping a patient NFC card</p>

      {/* Animation */}
      <div className="card text-center mb-4 py-8">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-3 transition-all ${scanning ? "bg-blue-100 nfc-pulse" : result ? "bg-green-100" : "bg-gray-100"}`}>
          {result ? <CheckCircle className="w-10 h-10 text-green-600" /> : <Wifi className={`w-10 h-10 ${scanning ? "text-blue-600" : "text-gray-400"}`} />}
        </div>
        <p className="font-semibold text-gray-700">{scanning ? "Scanning…" : result ? `✓ ${result.patientName}` : "Ready to scan"}</p>
      </div>

      {/* Manual input */}
      <div className="card mb-4">
        <label className="label">Enter NFC Card ID</label>
        <div className="flex gap-2">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&scan()} placeholder="e.g. NFC-001" className="inp flex-1" />
          <button onClick={()=>scan()} disabled={scanning} className="btn-blue">Scan</button>
        </div>
      </div>

      {/* Demo cards */}
      <div className="card mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" />Demo Cards</p>
        <div className="space-y-2">
          {DEMO_CARDS.map(c=>(
            <button key={c.id} onClick={()=>scan(c.id)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition text-left">
              <div>
                <p className="font-medium text-sm text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-500">{c.info} · <span className="font-mono">{c.id}</span></p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Access options */}
      {result && (
        <div className="card">
          <p className="text-sm font-semibold text-gray-700 mb-3">Access for <span className="text-blue-600">{result.patientName}</span></p>
          <div className="space-y-2">
            {accessOptions.map(o=>(
              <button key={o.key} onClick={()=>nav(`/${o.key}/${result.nfcCardId}`)}
                className="w-full flex items-center justify-between p-3 rounded-xl border-2 hover:border-blue-300 hover:bg-blue-50 transition text-left">
                <div>
                  <p className="font-semibold text-sm text-gray-800">{o.label}</p>
                  <p className="text-xs text-gray-500">{o.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}