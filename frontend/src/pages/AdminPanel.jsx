import { useEffect, useState } from "react";
import api from "../api";
import toast from "react-hot-toast";
import { Users, Plus, Search } from "lucide-react";

const EMPTY = { nfcCardId:"", name:"", age:"", phone:"", bloodGroup:"O+", location:"", chronicDiseases:"", allergies:"", currentMedicines:"" };

export default function AdminPanel() {
  const [patients,setPatients] = useState([]);
  const [search,setSearch]     = useState("");
  const [showForm,setShowForm] = useState(false);
  const [form,setForm]         = useState(EMPTY);

  useEffect(()=>{ api.get("/admin/patients").then(r=>setPatients(r.data.data)).catch(()=>toast.error("Failed to load")); },[]);

  const create = async () => {
    try {
      await api.post("/admin/patients", {
        nfcCardId: form.nfcCardId,
        emergency: {
          name: form.name, age: Number(form.age), phone: form.phone,
          bloodGroup: form.bloodGroup, location: form.location,
          chronicDiseases: form.chronicDiseases.split(",").map(s=>s.trim()).filter(Boolean),
          allergies:        form.allergies.split(",").map(s=>s.trim()).filter(Boolean),
          currentMedicines: form.currentMedicines.split(",").map(s=>s.trim()).filter(Boolean),
        },
      });
      toast.success("Patient created");
      setShowForm(false); setForm(EMPTY);
      const r = await api.get("/admin/patients"); setPatients(r.data.data);
    } catch(e) { toast.error(e.response?.data?.message||"Failed"); }
  };

  const filtered = patients.filter(p =>
    p.emergency?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.nfcCardId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Users className="w-6 h-6 text-purple-600"/>Admin Panel</h1>
        <button onClick={()=>setShowForm(s=>!s)} className="btn-blue flex items-center gap-1"><Plus className="w-4 h-4"/>Add Patient</button>
      </div>

      {showForm && (
        <div className="card mb-4 border-2 border-purple-200">
          <p className="font-semibold text-gray-700 mb-3">New Patient & NFC Card</p>
          <div className="grid grid-cols-2 gap-3">
            {[["nfcCardId","NFC Card ID","NFC-003"],["name","Full Name","Jane Doe"],["age","Age","28","number"],["phone","Phone","9876543210"],["location","Location","Mumbai"],].map(([k,l,p,t])=>(
              <div key={k}><label className="label">{l}</label><input type={t||"text"} placeholder={p} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} className="inp"/></div>
            ))}
            <div><label className="label">Blood Group</label>
              <select value={form.bloodGroup} onChange={e=>setForm({...form,bloodGroup:e.target.value})} className="inp">
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b}>{b}</option>)}
              </select>
            </div>
            {[["chronicDiseases","Chronic Diseases (comma-separated)"],["allergies","Allergies (comma-separated)"],["currentMedicines","Medicines (comma-separated)"]].map(([k,l])=>(
              <div key={k} className="col-span-2"><label className="label">{l}</label><input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} className="inp" placeholder="e.g. Diabetes, Hypertension"/></div>
            ))}
          </div>
          <div className="flex gap-2 mt-3"><button onClick={create} className="btn-blue">Create</button><button onClick={()=>setShowForm(false)} className="btn-ghost">Cancel</button></div>
        </div>
      )}

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
        <input placeholder="Search by name or card ID…" value={search} onChange={e=>setSearch(e.target.value)} className="inp pl-9"/>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>{["Patient","NFC Card ID","Blood Group","Phone","Registered"].map(h=><th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">No patients found</td></tr>
            ) : filtered.map(p=>(
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{p.emergency?.name}</td>
                <td className="px-4 py-3 font-mono text-gray-600 text-xs">{p.nfcCardId}</td>
                <td className="px-4 py-3"><span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full text-xs">{p.emergency?.bloodGroup}</span></td>
                <td className="px-4 py-3 text-gray-600">{p.emergency?.phone}</td>
                <td className="px-4 py-3 text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-400">{filtered.length} record(s)</div>
      </div>
    </div>
  );
}