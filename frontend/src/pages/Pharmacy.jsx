import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import toast from "react-hot-toast";
import OTPModal from "./OTPModal";
import { ArrowLeft, Pill, CheckCircle, AlertTriangle, Shield } from "lucide-react";

export default function Pharmacy() {
  const { id }  = useParams();
  const { user } = useAuth();
  const nav     = useNavigate();
  const [data,setData]         = useState(null);
  const [showOTP,setShowOTP]   = useState(false);
  const [otpLoad,setOtpLoad]   = useState(false);

  const requestAccess = async () => {
    try {
      const r = await api.post("/pharmacy/request", { nfcCardId: id });
      toast.success("Pharmacy verified! OTP sent.");
      if (r.data.devOTP) toast(`🔑 DEV OTP: ${r.data.devOTP}`, { duration:15000 });
      setShowOTP(true);
    } catch(e) { toast.error(e.response?.data?.message||"Access denied"); }
  };

  const verifyOTP = async (otp) => {
    setOtpLoad(true);
    try {
      const { data:s } = await api.post("/otp/verify", { nfcCardId:id, accessType:"pharmacy", otp });
      localStorage.setItem("sessionToken", s.sessionToken);
      setShowOTP(false);
      const { data:res } = await api.get(`/pharmacy/prescription/${id}`);
      setData(res.data); toast.success("Prescription access granted");
    } catch(e) { toast.error(e.response?.data?.message||"Failed"); }
    finally { setOtpLoad(false); }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <button onClick={()=>nav("/scan")}><ArrowLeft className="w-5 h-5 text-gray-500"/></button>
        <div><h1 className="font-bold text-gray-900 text-xl">Pharmacy Access</h1><p className="text-xs text-gray-500">Prescriptions only — no diagnosis</p></div>
      </div>

      {/* Pharmacy credentials badge */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-600"/>
        <div className="text-sm">
          <p className="font-semibold text-green-800">{user?.pharmacyName}</p>
          <p className="text-green-600 text-xs">License: {user?.drugLicenseId} · GSTIN: {user?.gstin}</p>
        </div>
      </div>

      {!data ? (
        <div className="card text-center py-12">
          <Pill className="w-14 h-14 text-green-400 mx-auto mb-3"/>
          <p className="font-bold text-gray-800 mb-1">Request Prescription Access</p>
          <p className="text-sm text-gray-500 mb-1">Your credentials will be verified automatically</p>
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1 inline-block mb-4">Prescriptions ONLY — no diagnosis or reports</p><br/>
          <button onClick={requestAccess} className="btn-green">Verify & Send OTP</button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="card border-l-4 border-l-green-500 flex items-center justify-between">
            <div><p className="font-bold text-gray-900">{data.patientName}</p><p className="text-sm text-gray-500">Blood Group: <span className="font-semibold text-red-600">{data.bloodGroup}</span></p></div>
            <Shield className="w-7 h-7 text-green-400"/>
          </div>

          {data.allergies?.length > 0 && (
            <div className="border-2 border-red-400 bg-red-50 rounded-xl p-3">
              <p className="font-bold text-red-700 mb-2 flex items-center gap-1"><AlertTriangle className="w-4 h-4"/>DRUG ALLERGIES</p>
              <div className="flex flex-wrap gap-2">{data.allergies.map(a=><span key={a} className="tag-red font-bold">{a}</span>)}</div>
            </div>
          )}

          <div className="card">
            <p className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Pill className="w-4 h-4 text-green-600"/>Current Prescription</p>
            {data.prescriptions?.length ? data.prescriptions.map((p,i)=>(
              <div key={i} className="bg-green-50 border border-green-200 rounded-xl p-3 mb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-900">{p.medicine}</p>
                    <p className="text-sm text-gray-600">{p.dosage} · {p.frequency}</p>
                    <p className="text-xs text-gray-400">Prescribed by {p.prescribedBy} · {new Date(p.date).toLocaleDateString()}</p>
                  </div>
                  <span className="bg-green-200 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full">Rx</span>
                </div>
              </div>
            )) : <p className="text-sm text-gray-400">No active prescriptions</p>}
          </div>

          <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1"><Shield className="w-3 h-3"/>Diagnosis and lab reports are not accessible through pharmacy access</p>
        </div>
      )}

      <OTPModal open={showOTP} onClose={()=>setShowOTP(false)} onVerify={verifyOTP} onResend={requestAccess} loading={otpLoad}/>
    </div>
  );
}