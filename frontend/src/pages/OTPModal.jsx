import { useState, useRef, useEffect } from "react";
import { Shield, X } from "lucide-react";

export default function OTPModal({ open, onClose, onVerify, onResend, loading }) {
  const [digits, setDigits] = useState(["","","","","",""]);
  const [secs, setSecs]     = useState(600);
  const refs = useRef([]);

  useEffect(() => {
    if (!open) { setDigits(["","","","","",""]); setSecs(600); return; }
    refs.current[0]?.focus();
    const t = setInterval(()=>setSecs(s=>s>0?s-1:0),1000);
    return ()=>clearInterval(t);
  }, [open]);

  const change = (val, i) => {
    if (!/^\d*$/.test(val)) return;
    const d = [...digits]; d[i]=val.slice(-1); setDigits(d);
    if (val && i<5) refs.current[i+1]?.focus();
    if (d.every(Boolean)) onVerify(d.join(""));
  };

  const keydown = (e,i) => { if (e.key==="Backspace"&&!digits[i]&&i>0) refs.current[i-1]?.focus(); };

  if (!open) return null;
  const fmt = s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-xl"><Shield className="w-5 h-5 text-blue-600"/></div>
              <div>
                <p className="font-bold text-gray-900">OTP Verification</p>
                <p className="text-xs text-gray-500">Enter the 6-digit code</p>
              </div>
            </div>
            <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600"/></button>
          </div>

          <div className="flex justify-center gap-2 mb-4">
            {digits.map((d,i)=>(
              <input key={i} ref={el=>refs.current[i]=el}
                type="text" inputMode="numeric" maxLength={1} value={d}
                onChange={e=>change(e.target.value,i)} onKeyDown={e=>keydown(e,i)}
                className={`w-10 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:border-blue-500 transition ${d?"border-blue-400 bg-blue-50":"border-gray-300"}`}
                disabled={loading}
              />
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mb-4">
            {secs>0 ? <>Expires in <span className="font-semibold text-blue-600">{fmt(secs)}</span></> : <span className="text-red-500">OTP expired</span>}
          </p>

          <button onClick={()=>onVerify(digits.join(""))} disabled={digits.join("").length!==6||loading} className="btn-blue w-full mb-2">
            {loading?"Verifying…":"Verify OTP"}
          </button>
          <button onClick={()=>{onResend();setDigits(["","","","","",""]);setSecs(600);}} disabled={secs>0||loading} className="w-full text-sm text-gray-400 hover:text-blue-600 disabled:opacity-40">
            Resend OTP
          </button>
        </div>
        <div className="bg-yellow-50 border-t px-5 py-2 rounded-b-2xl text-xs text-yellow-600 text-center">
          🔒 Session expires 15 minutes after verification
        </div>
      </div>
    </div>
  );
}