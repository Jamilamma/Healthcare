require("dotenv").config();
const mongoose = require("mongoose");
const Patient  = require("./models/Patient");
const User     = require("./models/User");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB..."));

const patients = [
  {
    nfcCardId: "NFC-001",
    emergency: {
      name:            "Arjun Mehta",
      age:             45,
      phone:           "9876543210",
      bloodGroup:      "B+",
      chronicDiseases: ["Diabetes Type 2", "Hypertension"],
      allergies:       ["Penicillin", "Aspirin"],
      currentMedicines:["Metformin 500mg", "Amlodipine 5mg"],
      emergencyContact:{ 
        name:     "Sunita Mehta", 
        phone:    "9876543211", 
        relation: "Wife" 
      },
      location: "Chennai, Tamil Nadu",
    },
    details: {
      gender:  "Male",
      address: "12 Anna Nagar, Chennai - 600040",
      email:   "arjun.mehta@email.com",
      height:  175,
      weight:  82,
      diagnosisHistory: [
        "Diabetes Type 2 (2018)", 
        "Hypertension (2020)"
      ],
      pastVisits: [{
        hospitalName: "Apollo Hospital",
        doctorName:   "Dr. Ramesh Kumar",
        visitDate:    new Date("2024-01-10"),
        diagnosis:    "Diabetes management",
        treatment:    "Metformin increased to 500mg twice daily",
      }],
    },
    prescriptions: [
      { 
        medicine:     "Metformin 500mg", 
        dosage:       "500mg", 
        frequency:    "Twice daily", 
        prescribedBy: "Dr. Ramesh Kumar", 
        date:         new Date("2024-01-10") 
      },
      { 
        medicine:     "Amlodipine 5mg", 
        dosage:       "5mg",   
        frequency:    "Once daily",  
        prescribedBy: "Dr. Ramesh Kumar", 
        date:         new Date("2024-01-10") 
      },
    ],
    reports: [
      { 
        reportType:  "blood_test", 
        title:       "HbA1c Report Jan 2024", 
        description: "HbA1c: 7.2% — Borderline. Repeat in 3 months.", 
        uploadedBy:  "Vijaya Diagnostics" 
      },
    ],
  },
  {
    nfcCardId: "NFC-002",
    emergency: {
      name:            "Priya Sharma",
      age:             32,
      phone:           "9845123456",
      bloodGroup:      "O+",
      chronicDiseases: ["Asthma"],
      allergies:       ["NSAIDs", "Dust"],
      currentMedicines:["Salbutamol Inhaler", "Montelukast 10mg"],
      emergencyContact:{ 
        name:     "Ravi Sharma", 
        phone:    "9845123457", 
        relation: "Husband" 
      },
      location: "Bangalore, Karnataka",
    },
    details: {
      gender:  "Female",
      address: "45 Koramangala, Bangalore - 560034",
      email:   "priya.sharma@email.com",
      height:  162,
      weight:  58,
      diagnosisHistory: ["Asthma since 2010"],
      pastVisits: [],
    },
    prescriptions: [
      { 
        medicine:     "Salbutamol Inhaler", 
        dosage:       "100mcg/puff", 
        frequency:    "As needed", 
        prescribedBy: "Dr. Anita Menon", 
        date:         new Date("2024-02-01") 
      },
    ],
    reports: [],
  },
];

const users = [
  { 
    name:         "Admin User",      
    email:        "admin@health.com",     
    password:     "Admin@123",    
    role:         "admin",           
    hospitalName: "HQ" 
  },
  { 
    name:         "Dr. Ramesh Kumar",     
    email:        "doctor@health.com",    
    password:     "Doctor@123",   
    role:         "doctor",          
    hospitalName: "Apollo Hospital" 
  },
  { 
    name:          "MedPlus Pharmacy",     
    email:         "pharmacy@health.com",  
    password:      "Pharmacy@123", 
    role:          "pharmacist",      
    pharmacyName:  "MedPlus Anna Nagar", 
    drugLicenseId: "TN-DL-001234", 
    gstin:         "33AABCT1234C1Z5" 
  },
  { 
    name:         "Vijaya Lab Tech",      
    email:        "lab@health.com",       
    password:     "LabTech@123",  
    role:         "lab_technician",  
    hospitalName: "Vijaya Diagnostics" 
  },
];

async function seed() {
  await Patient.deleteMany({});
  await User.deleteMany({});
  await Patient.insertMany(patients);
  for (const u of users) await User.create(u);

  console.log("\n✅ Database seeded!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(" DEMO LOGIN CREDENTIALS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  users.forEach(u => 
    console.log(` ${u.role.padEnd(16)} | ${u.email.padEnd(22)} | ${u.password}`)
  );
  console.log("\n NFC CARD IDs FOR TESTING:");
  console.log("  NFC-001  →  Arjun Mehta  (B+, Diabetes)");
  console.log("  NFC-002  →  Priya Sharma (O+, Asthma)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  mongoose.disconnect();
}

seed().catch(console.error);
