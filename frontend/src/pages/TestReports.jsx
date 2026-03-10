import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import toast from "react-hot-toast";
import OTPModal from "./OTPModal";
import { ArrowLeft, Shield, Clock, Activity, Upload } from "lucide-react";

const ICONS = { blood_test:"🩸", xray:"🦴", ct_scan:"🧠", mri:"🔬", prescription:"💊", doctor_note:"📝", other:"📄" };

export default function TestReports() {
  const { id }  = useParams();
  const { user } = useAuth();
  const nav     = useNavigate();
  const [data,setData]           = useState(null);
  const [showOTP,setShowOTP]     = useState(false);
  const [otpLoad,setOtpLoad]     = useState(false);
  const [expiry,setExpiry]       = useState(null);
  const [showForm,setShowForm]   = useState(false);
  
const [form,setForm] = useState({ reportType:"blood_test", title:"", description:"" });
  const requestOTP = async () => {
    try {
      const r = await api.post("/otp/request", { nfcCardId: id, accessType: "test_reports" });
      toast.success("OTP sent"); if (r.data.devOTP) toast(`🔑 DEV OTP: ${r.data.devOTP}`, { duration:15000 });
      setShowOTP(true);
    } catch(e) { toast.error(e.response?.data?.message||"Failed"); }
  };

  const verifyOTP = async (otp) => {
    setOtpLoad(true);
    try {
      const { data:s } = await api.post("/otp/verify", { nfcCardId:id, accessType:"test_reports", otp });
      localStorage.setItem("sessionToken", s.sessionToken);
      setExpiry(new Date(s.sessionExpiry));
      setShowOTP(false);
      const { data:res } = await api.get(`/patient/reports/${id}`);
      setData(res.data); toast.success("Reports loaded");
    } catch(e) { toast.error(e.response?.data?.message||"Failed"); }
    finally { setOtpLoad(false); }
  };

  const addReport = async () => {
    if (!form.title) return toast.error("Title required");
    try {
      await api.post(`/patient/reports/${id}`, form);
      toast.success("Report added");
      setShowForm(false); setForm({ type:"blood_test", title:"", description:"" });
      const { data:res } = await api.get(`/patient/reports/${id}`);
      setData(res.data);
    } catch(e) { toast.error(e.response?.data?.message||"Failed"); }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <button onClick={()=>nav("/scan")}><ArrowLeft className="w-5 h-5 text-gray-500"/></button>
        <div><h1 className="font-bold text-gray-900 text-xl">Test & Reports</h1><p className="text-xs text-gray-500">OTP protected · View only</p></div>
      </div>

      {!data ? (
        <div className="card text-center py-12">
          <Activity className="w-14 h-14 text-green-400 mx-auto mb-3"/>
          <p className="font-bold text-gray-800 mb-1">OTP Required for Lab Reports</p>
          <p className="text-sm text-gray-500 mb-4">Blood tests, X-rays, CT/MRI — OTP protected</p>
          <button onClick={requestOTP} className="btn-blue">Request OTP</button>
        </div>
      ) : (
        <div className="space-y-3">
          {expiry && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-sm text-green-700 flex items-center justify-between">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4"/>Session expires {expiry.toLocaleTimeString()}</span>
              {["admin","doctor","lab_technician"].includes(user?.role ||"") && (
                <button onClick={()=>setShowForm(s=>!s)} className="text-blue-600 text-xs font-semibold flex items-center gap-1"><Upload className="w-3.5 h-3.5"/>Add Report</button>
              )}
            </div>
          )}

          {showForm && (
            <div className="card border-2 border-blue-200">
              <p className="font-semibold text-gray-700 mb-3">Add New Report</p>
              <div className="space-y-2">
                <div>
                  <label className="label">Type</label>
                  <select value={form.reportType} onChange={e=>setForm({...form,reportType:e.target.value})} className="inp">
                    {Object.keys(ICONS).map(t=><option key={t} value={t}>{t.replace("_"," ")}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Title</label>
                  <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="inp" placeholder="e.g. HbA1c Report Mar 2025"/>
                </div>
                <div>
                  <label className="label">Notes</label>
                  <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="inp" rows={2} placeholder="Findings…"/>
                </div>
                <div className="flex gap-2"><button onClick={addReport} className="btn-blue">Save</button><button onClick={()=>setShowForm(false)} className="btn-ghost">Cancel</button></div>
              </div>
            </div>
          )}

          <div className="card">
            <p className="font-semibold text-gray-700 mb-3">Reports for {data.patientName}</p>
            {data.reports?.length ? data.reports.map((r,i)=>(
              <div key={r._id} className="border rounded-xl p-3 mb-2 flex items-start gap-3">
                <span className="text-2xl">{ICONS[r?.reportType]||"📄"}</span>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{r.title}</p>
                  <p className="text-xs text-gray-500">By {r.uploadedBy} · {new Date(r.uploadedAt).toLocaleDateString()}</p>
                  {r.description && <p className="text-sm text-gray-700 mt-1">{r.description}</p>}
                </div>
              </div>
            )) : <p className="text-sm text-gray-400 text-center py-4">No reports yet</p>}
          </div>
        </div>
      )}

      <OTPModal open={showOTP} onClose={()=>setShowOTP(false)} onVerify={verifyOTP} onResend={requestOTP} loading={otpLoad}/>
    </div>
  );
}