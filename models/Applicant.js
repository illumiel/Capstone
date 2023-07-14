const mongoose = require('mongoose');

const ApplicantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  age: {
    type: String,
    required: true
  },
  education: {
    type: [String],
    required: true
  },
  experience: {
    type: [String],
    required: true
  },
  language: {
    type: [String],
    required: true
  },
  resume: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const Applicant = mongoose.model('Applicant', ApplicantSchema);

module.exports = Applicant;
