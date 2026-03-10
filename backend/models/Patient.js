const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  nfcCardId: { 
    type: String, 
    required: true, 
    unique: true 
  },

  // EMERGENCY — always visible, no OTP
  emergency: {
    name:             { type: String, required: true },
    age:              { type: Number, required: true },
    phone:            { type: String, required: true },
    bloodGroup:       { type: String, required: true },
    chronicDiseases:  [String],
    allergies:        [String],
    currentMedicines: [String],
    emergencyContact: { 
      name:     String, 
      phone:    String, 
      relation: String 
    },
    location: String,
  },

  // PATIENT DETAILS — OTP required
  details: {
    gender:    String,
    address:   String,
    email:     String,
    height:    Number,
    weight:    Number,
    diagnosisHistory: [String],
    pastVisits: [{
      hospitalName: String,
      doctorName:   String,
      visitDate:    Date,
      diagnosis:    String,
      treatment:    String,
    }],
  },

  // PHARMACY — prescription only
  prescriptions: [{
    medicine:     String,
    dosage:       String,
    frequency:    String,
    prescribedBy: String,
    date:         Date,
  }],

  // TEST REPORTS — OTP required
 reports: [{
    reportType:  String,
    title:       String,
    description: String,
    uploadedBy:  String,
    uploadedAt:  { type: Date, default: Date.now },
  }],
}, { timestamps: true });

module.exports = mongoose.model("Patient", patientSchema);