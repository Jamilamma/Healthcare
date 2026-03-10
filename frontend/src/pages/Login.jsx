import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Heart } from "lucide-react";

const DEMOS = [
  { label:"Admin",       email:"admin@health.com",    pw:"Admin@123" },
  { label:"Doctor",      email:"doctor@health.com",   pw:"Doctor@123" },
  { label:"Pharmacist",  email:"pharmacy@health.com", pw:"Pharmacy@123" },
  { label:"Lab Tech",    email:"lab@health.com",      pw:"LabTech@123" },
];

export default function Login() {
  const [form, setForm] = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Logged in!");
      nav("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="inline-flex bg-blue-600 p-3 rounded-2xl mb-3">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Smart Health Access</h1>
          <p className="text-sm text-gray-500">Emergency Health Data System</p>
        </div>

        <form onSubmit={submit} className="card space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="inp" placeholder="email@example.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="inp" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="btn-blue w-full">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="card mt-3">
          <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Quick Demo Login</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMOS.map(d=>(
              <button key={d.label} onClick={()=>setForm({email:d.email,password:d.pw})}
                className="text-left p-2 rounded-lg border hover:bg-blue-50 transition">
                <p className="text-xs font-semibold text-gray-700">{d.label}</p>
                <p className="text-xs text-gray-400 truncate">{d.email}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">Run <code className="bg-gray-100 px-1 rounded">npm run seed</code> first</p>
        </div>
      </div>
    </div>
  );
}