require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const jwt      = require("jsonwebtoken");
const Patient  = require("./models/Patient");
const User     = require("./models/User");

const app = express();

// ── MIDDLEWARE ──────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ── DATABASE ────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => { 
    console.error("❌ MongoDB error:", err.message); 
    process.exit(1); 
  });

// ── HELPERS ─────────────────────────────────────────
const signToken = (id) => 
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// In-memory OTP store
const otpStore = {};

// In-memory session store
const sessionStore = {};

const generateOTP = () => 
  Math.floor(100000 + Math.random() * 900000).toString();

// ── AUTH MIDDLEWARE ──────────────────────────────────
const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) 
    return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(
      auth.split(" ")[1], 
      process.env.JWT_SECRET
    );
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) 
      return res.status(401).json({ message: "User not found" });
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ── SESSION MIDDLEWARE ───────────────────────────────
const verifySession = (req, res, next) => {
  const token = req.headers["x-session-token"];
  if (!token || !sessionStore[token]) 
    return res.status(401).json({ 
      message: "OTP session required or expired" 
    });
  if (Date.now() > sessionStore[token].expiry)  
    return res.status(401).json({ 
      message: "Session expired, verify OTP again" 
    });
  req.session = sessionStore[token];
  next();
};

// ════════════════════════════════════════════════════
// AUTH ROUTES
// ════════════════════════════════════════════════════

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { 
      name, email, password, role, 
      hospitalName, pharmacyName, 
      drugLicenseId, gstin 
    } = req.body;

    if (await User.findOne({ email })) 
      return res.status(400).json({ 
        message: "Email already registered" 
      });

    const user = await User.create({ 
      name, email, password, role, 
      hospitalName, pharmacyName, 
      drugLicenseId, gstin 
    });

    res.status(201).json({ 
      success: true, 
      data: { 
        _id:   user._id, 
        name:  user.name, 
        email: user.email, 
        role:  user.role, 
        token: signToken(user._id) 
      } 
    });
  } catch (e) { 
    res.status(500).json({ message: e.message }); 
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) 
      return res.status(401).json({ 
        message: "Invalid email or password" 
      });

    res.json({ 
      success: true, 
      data: {
        _id:          user._id, 
        name:         user.name, 
        email:        user.email, 
        role:         user.role,
        hospitalName: user.hospitalName, 
        pharmacyName: user.pharmacyName,
        drugLicenseId:user.drugLicenseId, 
        gstin:        user.gstin,
        token:        signToken(user._id),
      }
    });
  } catch (e) { 
    res.status(500).json({ message: e.message }); 
  }
});

// ════════════════════════════════════════════════════
// NFC SCAN — public check
// ════════════════════════════════════════════════════

app.get("/api/scan/:nfcCardId", async (req, res) => {
  try {
    const patient = await Patient.findOne({ 
      nfcCardId: req.params.nfcCardId 
    });
    if (!patient) 
      return res.status(404).json({ 
        message: "Card not found or invalid" 
      });
    res.json({ 
      success:     true, 
      patientName: patient.emergency.name, 
      nfcCardId:   patient.nfcCardId 
    });
  } catch (e) { 
    res.status(500).json({ message: e.message }); 
  }
});

// ════════════════════════════════════════════════════
// EMERGENCY — no OTP needed
// ════════════════════════════════════════════════════

app.get("/api/emergency/:nfcCardId", protect, async (req, res) => {
  try {
    const patient = await Patient.findOne({ 
      nfcCardId: req.params.nfcCardId 
    });
    if (!patient) 
      return res.status(404).json({ message: "Patient not found" });

    // FIX: use .toObject() so spread works on Mongoose subdocument
    const emergency = patient.emergency.toObject();

    res.json({ 
      success: true, 
      data: { 
        nfcCardId: patient.nfcCardId, 
        ...emergency
      } 
    });
  } catch (e) { 
    res.status(500).json({ message: e.message }); 
  }
});

// ════════════════════════════════════════════════════
// OTP ROUTES
// ════════════════════════════════════════════════════

// Request OTP
app.post("/api/otp/request", protect, async (req, res) => {
  try {
    const { nfcCardId, accessType } = req.body;
    const patient = await Patient.findOne({ nfcCardId });
    if (!patient) 
      return res.status(404).json({ message: "Patient not found" });

    const otp = generateOTP();
    const key = `${req.user._id}_${nfcCardId}_${accessType}`;
    otpStore[key] = { 
      otp, 
      expiry: Date.now() + 10 * 60 * 1000 
    };

    console.log(`\n🔑 OTP [${accessType}] for ${patient.emergency.name}: ${otp}\n`);

    res.json({ 
      success: true, 
      message: "OTP generated", 
      devOTP:  otp  // shows on screen in prototype mode
    });
  } catch (e) { 
    res.status(500).json({ message: e.message }); 
  }
});

// Verify OTP
app.post("/api/otp/verify", protect, async (req, res) => {
  try {
    const { nfcCardId, accessType, otp } = req.body;
    const key    = `${req.user._id}_${nfcCardId}_${accessType}`;
    const stored = otpStore[key];

    if (!stored) 
      return res.status(400).json({ message: "No OTP requested" });
    if (Date.now() > stored.expiry) 
      return res.status(400).json({ message: "OTP expired" });
    if (stored.otp !== otp.trim()) 
      return res.status(400).json({ message: "Incorrect OTP" });

    // Delete OTP — single use only
    delete otpStore[key];

    // Create 15 minute session
    const sessionToken  = require("crypto")
      .randomBytes(24).toString("hex");
    const sessionExpiry = Date.now() + 15 * 60 * 1000;

    sessionStore[sessionToken] = { 
      nfcCardId, 
      accessType, 
      userId: String(req.user._id), 
      expiry: sessionExpiry 
    };

    res.json({ 
      success:       true, 
      sessionToken, 
      sessionExpiry: new Date(sessionExpiry) 
    });
  } catch (e) { 
    res.status(500).json({ message: e.message }); 
  }
});

// ════════════════════════════════════════════════════
// PATIENT DETAILS — OTP session required
// ════════════════════════════════════════════════════

app.get(
  "/api/patient/details/:nfcCardId", 
  protect, 
  verifySession, 
  async (req, res) => {
    try {
      if (
        req.session.nfcCardId  !== req.params.nfcCardId || 
        req.session.accessType !== "patient_details"
      ) return res.status(403).json({ message: "Session mismatch" });

      const patient = await Patient.findOne({ 
        nfcCardId: req.params.nfcCardId 
      });
      if (!patient) 
        return res.status(404).json({ message: "Patient not found" });

      res.json({ 
        success: true, 
        data: { 
          emergency: patient.emergency, 
          details:   patient.details 
        } 
      });
    } catch (e) { 
      res.status(500).json({ message: e.message }); 
    }
  }
);

// ════════════════════════════════════════════════════
// TEST REPORTS — OTP session required
// ════════════════════════════════════════════════════

// Get reports
app.get(
  "/api/patient/reports/:nfcCardId", 
  protect, 
  verifySession, 
  async (req, res) => {
    try {
      if (
        req.session.nfcCardId  !== req.params.nfcCardId || 
        req.session.accessType !== "test_reports"
      ) return res.status(403).json({ message: "Session mismatch" });

      const patient = await Patient.findOne({ 
        nfcCardId: req.params.nfcCardId 
      });
      if (!patient) 
        return res.status(404).json({ message: "Patient not found" });

      res.json({ 
        success: true, 
        data: { 
          patientName: patient.emergency.name, 
          reports:     patient.reports 
        } 
      });
    } catch (e) { 
      res.status(500).json({ message: e.message }); 
    }
  }
);

// Upload report
app.post(
  "/api/patient/reports/:nfcCardId", 
  protect, 
  async (req, res) => {
    try {
      const patient = await Patient.findOne({ 
        nfcCardId: req.params.nfcCardId 
      });
      if (!patient) 
        return res.status(404).json({ message: "Patient not found" });

      patient.reports.push({ 
        ...req.body, 
        uploadedBy: req.user.name 
      });
      await patient.save();

      res.json({ success: true, message: "Report added" });
    } catch (e) { 
      res.status(500).json({ message: e.message }); 
    }
  }
);

// ════════════════════════════════════════════════════
// PHARMACY — OTP session required
// ════════════════════════════════════════════════════

// Request pharmacy access
app.post("/api/pharmacy/request", protect, async (req, res) => {
  try {
    if (req.user.role !== "pharmacist") 
      return res.status(403).json({ message: "Pharmacists only" });
    if (!req.user.drugLicenseId || !req.user.gstin) 
      return res.status(403).json({ 
        message: "No Drug License or GSTIN on file" 
      });

    const { nfcCardId } = req.body;
    const patient = await Patient.findOne({ nfcCardId });
    if (!patient) 
      return res.status(404).json({ message: "Patient not found" });

    const otp = generateOTP();
    const key = `${req.user._id}_${nfcCardId}_pharmacy`;
    otpStore[key] = { 
      otp, 
      expiry: Date.now() + 10 * 60 * 1000 
    };

    console.log(`\n🔑 PHARMACY OTP for ${patient.emergency.name}: ${otp}\n`);

    res.json({ 
      success: true, 
      message: "Pharmacy verified. OTP generated.", 
      devOTP:  otp 
    });
  } catch (e) { 
    res.status(500).json({ message: e.message }); 
  }
});

// Get prescription
app.get(
  "/api/pharmacy/prescription/:nfcCardId", 
  protect, 
  verifySession, 
  async (req, res) => {
    try {
      if (
        req.session.nfcCardId  !== req.params.nfcCardId || 
        req.session.accessType !== "pharmacy"
      ) return res.status(403).json({ message: "Session mismatch" });

      const patient = await Patient.findOne({ 
        nfcCardId: req.params.nfcCardId 
      });
      if (!patient) 
        return res.status(404).json({ message: "Patient not found" });

      res.json({ 
        success: true, 
        data: {
          patientName:   patient.emergency.name,
          bloodGroup:    patient.emergency.bloodGroup,
          allergies:     patient.emergency.allergies,
          prescriptions: patient.prescriptions,
        }
      });
    } catch (e) { 
      res.status(500).json({ message: e.message }); 
    }
  }
);

// ════════════════════════════════════════════════════
// ADMIN ROUTES
// ════════════════════════════════════════════════════

// Get all patients
app.get("/api/admin/patients", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") 
      return res.status(403).json({ message: "Admins only" });

    const patients = await Patient.find({}).select(
      "nfcCardId emergency.name emergency.bloodGroup emergency.phone createdAt"
    );
    res.json({ 
      success: true, 
      count:   patients.length, 
      data:    patients 
    });
  } catch (e) { 
    res.status(500).json({ message: e.message }); 
  }
});

// Create new patient
app.post("/api/admin/patients", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") 
      return res.status(403).json({ message: "Admins only" });

    const patient = await Patient.create(req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (e) { 
    res.status(500).json({ message: e.message }); 
  }
});

// ════════════════════════════════════════════════════
// START SERVER
// ════════════════════════════════════════════════════

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => 
  console.log(`🚀 Server running → http://localhost:${PORT}`)
);
