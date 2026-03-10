import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import toast from "react-hot-toast";
import { ArrowLeft, Phone, AlertTriangle, Pill } from "lucide-react";

export default function Emergency() {
  const { id } = useParams();
  const nav = useNavigate();
  const [d, setD] = useState(null);

  useEffect(() => {
    api.get(`/emergency/${id}`)
      .then(r => setD(r.data.data))
      .catch(e => { toast.error(e.response?.data?.message || "Failed to load"); });
  }, [id]);

  if (!d) return <div className="text-center py-20 text-gray-400">Loading…</div>;

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-red-600 text-white rounded-2xl p-4 mb-4 flex items-center gap-3">
        <AlertTriangle className="w-7 h-7 flex-shrink-0" />
        <div>
          <p className="font-bold text-lg">EMERGENCY ACCESS</p>
          <p className="text-red-200 text-xs">No OTP required · Access logged · {new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Identity */}
      <div className="card mb-3 flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{d.name}</p>
          <p className="text-gray-500 text-sm">Age {d.age} · {d.location}</p>
        </div>
        <div className="text-center">
          <div className="bg-red-100 text-red-700 font-bold text-xl px-4 py-2 rounded-xl">{d.bloodGroup}</div>
          <p className="text-xs text-gray-400 mt-1">Blood Group</p>
        </div>
      </div>

      {/* Contacts */}
      <div className="card mb-3">
        <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><Phone className="w-4 h-4 text-blue-600"/>Contacts</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Patient</span><a href={`tel:${d.phone}`} className="text-blue-600 font-semibold">{d.phone}</a></div>
          {d.emergencyContact?.phone && (
            <div className="flex justify-between"><span className="text-gray-500">{d.emergencyContact.relation} ({d.emergencyContact.name})</span><a href={`tel:${d.emergencyContact.phone}`} className="text-red-600 font-semibold">{d.emergencyContact.phone}</a></div>
          )}
        </div>
      </div>

      {/* Allergies */}
      {d.allergies?.length > 0 && (
        <div className="border-2 border-red-400 bg-red-50 rounded-xl p-4 mb-3">
          <p className="font-bold text-red-800 mb-2">⚠️ ALLERGIES — DO NOT ADMINISTER</p>
          <div className="flex flex-wrap gap-2">{d.allergies.map(a=><span key={a} className="tag-red font-bold">{a}</span>)}</div>
        </div>
      )}

      {/* Chronic + Medicines */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card">
          <p className="font-semibold text-gray-700 text-sm mb-2">Chronic Conditions</p>
          {d.chronicDiseases?.length
            ? d.chronicDiseases.map(c=><span key={c} className="tag-blue block mb-1 text-xs">{c}</span>)
            : <p className="text-gray-400 text-xs">None</p>}
        </div>
        <div className="card">
          <p className="font-semibold text-gray-700 text-sm mb-2 flex items-center gap-1"><Pill className="w-3.5 h-3.5"/>Medicines</p>
          {d.currentMedicines?.length
            ? d.currentMedicines.map(m=><p key={m} className="text-xs text-gray-700 mb-0.5">• {m}</p>)
            : <p className="text-gray-400 text-xs">None</p>}
        </div>
      </div>

      <button onClick={()=>nav("/scan")} className="btn-ghost flex items-center gap-1"><ArrowLeft className="w-4 h-4"/>Back to Scan</button>
    </div>
  );
}