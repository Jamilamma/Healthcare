import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Scan, AlertTriangle, FileText, Pill, Activity, Shield, Users } from "lucide-react";

const modules = {
  admin:          [{ to:"/scan", icon:<Scan/>, label:"Scan NFC Card", color:"blue" }, { to:"/admin", icon:<Users/>, label:"Admin Panel", color:"purple" }],
  doctor:         [{ to:"/scan", icon:<Scan/>, label:"Scan NFC Card", color:"blue" }, { icon:<AlertTriangle/>, label:"Emergency Access",  color:"red",   note:"After scan" }, { icon:<FileText/>, label:"Patient Details", color:"green", note:"OTP required" }, { icon:<Activity/>, label:"Test & Reports",   color:"yellow",note:"OTP required" }],
  pharmacist:     [{ to:"/scan", icon:<Scan/>, label:"Scan NFC Card", color:"blue" }, { icon:<Pill/>,          label:"Pharmacy Access",  color:"green", note:"After scan" }],
  lab_technician: [{ to:"/scan", icon:<Scan/>, label:"Scan NFC Card", color:"blue" }, { icon:<Activity/>,     label:"Upload Reports",   color:"yellow",note:"After scan" }],
};
const colors = { blue:"bg-blue-50 text-blue-600", red:"bg-red-50 text-red-600", green:"bg-green-50 text-green-600", yellow:"bg-yellow-50 text-yellow-600", purple:"bg-purple-50 text-purple-600" };

export default function Dashboard() {
  const { user } = useAuth();
  const cards = modules[user?.role] || modules.doctor;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, <span className="text-blue-600">{user?.name}</span></h1>
        <p className="text-gray-500 text-sm">{user?.hospitalName || user?.pharmacyName || "Smart Health System"}</p>
      </div>

      {/* CTA */}
      <div className="bg-blue-600 text-white rounded-2xl p-5 mb-6 flex items-center justify-between">
        <div>
          <p className="font-bold text-lg">Scan Patient NFC Card</p>
          <p className="text-blue-200 text-sm">Tap a card to begin access flow</p>
        </div>
        <Link to="/scan" className="bg-white text-blue-600 font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 flex items-center gap-2">
          <Scan className="w-4 h-4" /> Scan
        </Link>
      </div>

      {/* Module cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((c,i)=>(
          <div key={i} className="card hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[c.color]}`}>
              {c.icon}
            </div>
            <p className="font-semibold text-gray-800 text-sm">{c.label}</p>
            {c.to
              ? <Link to={c.to} className="text-xs text-blue-600 mt-1 block">Open →</Link>
              : <p className="text-xs text-gray-400 mt-1">{c.note}</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
        <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
        All access is logged. OTP verification required for sensitive data. Sessions expire in 15 minutes.
      </div>
    </div>
  );
}