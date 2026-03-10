import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import toast from "react-hot-toast";
import OTPModal from "./OTPModal";
import { ArrowLeft, Shield, Clock, User, Building2 } from "lucide-react";

export default function PatientDetails() {
  const { id }  = useParams();
  const nav     = useNavigate();
  const [data, setData]         = useState(null);
  const [showOTP, setShowOTP]   = useState(false);
  const [otpLoad, setOtpLoad]   = useState(false);
  const [expiry, setExpiry]     = useState(null);

  const requestOTP = async () => {
    try {
      const r = await api.post("/otp/request", { nfcCardId: id, accessType: "patient_details" });
      toast.success("OTP sent — check server console");
      if (r.data.devOTP) toast(`🔑 DEV OTP: ${r.data.devOTP}`, { duration: 15000 });
      setShowOTP(true);
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
  };

  const verifyOTP = async (otp) => {
    setOtpLoad(true);
    try {
      const { data: s } = await api.post("/otp/verify", { nfcCardId: id, accessType: "patient_details", otp });
      localStorage.setItem("sessionToken", s.sessionToken);
      setExpiry(new Date(s.sessionExpiry));
      setShowOTP(false);
      const { data: res } = await api.get(`/patient/details/${id}`);
      setData(res.data);
      toast.success("Access granted");
    } catch (e) { toast.error(e.response?.data?.message || "Verification failed"); }
    finally { setOtpLoad(false); }
  };

  const em = data?.emergency;
  const dt = data?.details;

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <button onClick={()=>nav("/scan")}><ArrowLeft className="w-5 h-5 text-gray-500"/></button>
        <div><h1 className="font-bold text-gray-900 text-xl">Patient Details</h1><p className="text-xs text-gray-500">Full records — OTP protected</p></div>
      </div>

      {!data ? (
        <div className="card text-center py-12">
          <Shield className="w-14 h-14 text-blue-400 mx-auto mb-3"/>
          <p className="font-bold text-gray-800 mb-1">OTP Required</p>
          <p className="text-sm text-gray-500 mb-4">An OTP will be sent to the patient's registered contact</p>
          <p className="text-xs font-mono text-gray-400 bg-gray-50 inline-block px-2 py-1 rounded mb-4">{id}</p><br/>
          <button onClick={requestOTP} className="btn-blue">Send OTP</button>
        </div>
      ) : (
        <div className="space-y-3">
          {expiry && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-sm text-green-700 flex items-center gap-2">
              <Clock className="w-4 h-4"/>Session expires {expiry.toLocaleTimeString()}
            </div>
          )}

          <div className="card">
            <p className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><User className="w-4 h-4 text-blue-600"/>Personal Info</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {[["Name",em?.name],["Age",em?.age],["Gender",dt?.gender],["Blood Group",em?.bloodGroup],["Phone",em?.phone],["Height / Weight",`${dt?.height||"—"}cm / ${dt?.weight||"—"}kg`],["Address",dt?.address],["Email",dt?.email]].map(([k,v])=>(
                <div key={k}><p className="text-gray-400 text-xs">{k}</p><p className="font-medium text-gray-800">{v||"—"}</p></div>
              ))}
            </div>
          </div>

          <div className="card">
            <p className="font-semibold text-gray-700 mb-2">Diagnosis History</p>
            {dt?.diagnosisHistory?.length ? dt.diagnosisHistory.map(d=><p key={d} className="text-sm text-gray-700">• {d}</p>) : <p className="text-sm text-gray-400">None recorded</p>}
          </div>

          <div className="card">
            <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><Building2 className="w-4 h-4 text-purple-600"/>Past Hospital Visits</p>
            {dt?.pastVisits?.length ? dt.pastVisits.map((v,i)=>(
              <div key={i} className="border rounded-lg p-3 mb-2 text-sm">
                <p className="font-semibold text-gray-800">{v.hospitalName}</p>
                <p className="text-gray-500">Dr. {v.doctorName} · {new Date(v.visitDate).toLocaleDateString()}</p>
                <p className="text-gray-700 mt-1"><span className="font-medium">Diagnosis:</span> {v.diagnosis}</p>
                <p className="text-gray-700"><span className="font-medium">Treatment:</span> {v.treatment}</p>
              </div>
            )) : <p className="text-sm text-gray-400">No visits recorded</p>}
          </div>
        </div>
      )}

      <OTPModal open={showOTP} onClose={()=>setShowOTP(false)} onVerify={verifyOTP} onResend={requestOTP} loading={otpLoad}/>
    </div>
  );
}