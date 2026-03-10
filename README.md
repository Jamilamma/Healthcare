# 🏥 Smart Emergency Health Data Access System — Prototype

> **Presented by:** Jamilamma N & Ishwariya M — BSC-CS (AI)

NFC-based health data access system with role-based privacy controls, OTP verification, and pharmacy access restrictions.

---

## 🚀 Quick Start (2 commands per folder)

### Backend
```bash
cd backend
npm install
cp .env.example .env        # add your MongoDB URI
npm run seed                 # loads demo data
npm run dev                  # runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                  # runs on http://localhost:5173
```

> **MongoDB URI:** `mongodb://localhost:27017/smart_health_prototype`  
> Start MongoDB before running the backend.

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@health.com | Admin@123 |
| Doctor | doctor@health.com | Doctor@123 |
| Pharmacist | pharmacy@health.com | Pharmacy@123 |
| Lab Technician | lab@health.com | LabTech@123 |

## 📇 Demo NFC Card IDs
```
NFC-001  →  Arjun Mehta  (45y · B+ · Diabetes, Hypertension)
NFC-002  →  Priya Sharma (32y · O+ · Asthma)
```

> In prototype mode, **OTP is shown directly on screen as a toast notification** — no email setup needed.

---

## 📁 Project Structure

```
prototype/
├── backend/
│   ├── server.js          ← All routes in one file
│   ├── seed.js            ← Demo data loader
│   ├── models/
│   │   ├── Patient.js     ← Emergency / Details / Reports / Pharmacy data
│   │   └── User.js        ← Doctor / Pharmacist / Admin / Lab Tech
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              ← Routes + Nav + Auth guard
│   │   ├── api.js               ← Axios with JWT + session token
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   └── pages/
│   │       ├── Login.jsx        ← Demo quick-fill buttons
│   │       ├── Dashboard.jsx    ← Role-based module cards
│   │       ├── ScanCard.jsx     ← NFC simulation + access menu
│   │       ├── Emergency.jsx    ← No OTP — instant critical data
│   │       ├── PatientDetails.jsx ← OTP flow → full records
│   │       ├── TestReports.jsx  ← OTP flow → lab reports + upload
│   │       ├── Pharmacy.jsx     ← License verify + OTP → Rx only
│   │       ├── AdminPanel.jsx   ← Patient management table
│   │       └── OTPModal.jsx     ← Reusable 6-digit OTP input
│   ├── index.html
│   ├── vite.config.js     ← Proxy: /api → localhost:5000
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 🔐 Access Permissions

| Module | Admin | Doctor | Lab Tech | Pharmacist |
|--------|-------|--------|----------|------------|
| Emergency Access | ✅ No OTP | ✅ No OTP | ✅ No OTP | ✅ No OTP |
| Patient Details | ✅ OTP | ✅ OTP | ❌ | ❌ |
| Test & Reports | ✅ OTP | ✅ OTP | ✅ OTP | ❌ |
| Upload Reports | ✅ | ✅ | ✅ | ❌ |
| Pharmacy/Rx | ❌ | ❌ | ❌ | ✅ License+OTP |
| Admin Panel | ✅ | ❌ | ❌ | ❌ |

---

## 🔗 API Endpoints

```
POST  /api/auth/login
POST  /api/auth/register

GET   /api/scan/:nfcCardId              ← public card check

GET   /api/emergency/:nfcCardId         ← no OTP

POST  /api/otp/request                  ← body: { nfcCardId, accessType }
POST  /api/otp/verify                   ← body: { nfcCardId, accessType, otp } → sessionToken

GET   /api/patient/details/:nfcCardId   ← needs x-session-token header
GET   /api/patient/reports/:nfcCardId   ← needs x-session-token header
POST  /api/patient/reports/:nfcCardId   ← upload report

POST  /api/pharmacy/request             ← verifies Drug License + GSTIN
GET   /api/pharmacy/prescription/:id    ← needs x-session-token header

GET   /api/admin/patients
POST  /api/admin/patients
```

---

## 🏗️ How the OTP Flow Works

```
1. User clicks "Send OTP"
2. Backend generates 6-digit OTP → stores in memory (10 min expiry)
3. OTP shown in console + returned in API response (prototype mode)
4. User enters OTP in modal
5. Backend verifies → returns sessionToken (15 min expiry)
6. Frontend stores sessionToken → sends in x-session-token header
7. Protected routes check sessionToken → grant access
8. Session auto-expires after 15 minutes
```

---

## 🛡️ Security Features (Prototype)

- JWT authentication (7-day tokens)
- Role-based route protection (frontend + backend)
- OTP: 6-digit, 10-minute expiry, single-use
- Session tokens: 15-minute expiry
- Pharmacy: Drug License + GSTIN verification required
- All sensitive routes require both JWT + session token

---

## 🔮 Future Enhancements (as per project doc)

- Real NFC card scanning (Web NFC API / Android app)
- Email/SMS OTP delivery
- AES encryption for stored health data
- Biometric authentication
- AI health risk prediction
- Insurance auto-claim integration
- Government ABHA ID integration
- Patient mobile app

---

*Smart Emergency Health Data Access System with Privacy Control*  
*Saving lives through secure technology ❤️*
