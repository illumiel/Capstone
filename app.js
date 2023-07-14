const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const multer = require('multer');
const path = require('path');
const { PDFExtract } = require('pdf.js-extract'); // Import PDFParser from pdf-parse package
const Applicant = require('./models/Applicant'); // Import the Applicant model

const app = express();

// Passport config
require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').MongoURI;

// Connect to MongoDB
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Bodyparser
app.use(express.urlencoded({ extended: false }));

// Express session middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Set storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify the directory where you want to store the uploaded files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Initialize multer upload
const upload = multer({ storage });

// Function to extract experience from the resume text
function extracteducationFromResume(resumeText) {
  // Implement your logic to extract skills from the resume text
  // and return them as an array
  // Placeholder implementation:
  const skillsRegex = /Education:\s+(.*)(?=\s+Experience:)/i;
  const skillsMatch = resumeText.match(skillsRegex);
  if (skillsMatch) {
    const skillsString = skillsMatch[1];
    // Split the skills string into an array using comma as the delimiter
    const skillsArray = skillsString.split(',').map(skill => skill.trim());
    return skillsArray;
  }
  return [];
}

// Function to extract experience from the resume text
function extractexperienceFromResume(resumeText) {
  // Implement your logic to extract skills from the resume text
  // and return them as an array
  // Placeholder implementation:
  const skillsRegex = /Experience:\s+(.*)(?=\s+Programming Language:)/i;
  const skillsMatch = resumeText.match(skillsRegex);
  if (skillsMatch) {
    const skillsString = skillsMatch[1];
    // Split the skills string into an array using comma as the delimiter
    const skillsArray = skillsString.split(',').map(skill => skill.trim());
    return skillsArray;
  }
  return [];
}

// Function to extract programming language from the resume text
function extractlanguageFromResume(resumeText) {
  // Implement your logic to extract skills from the resume text
  // and return them as an array
  // Placeholder implementation:
  const skillsRegex = /Programming Language:\s+(.*)/i;
  const skillsMatch = resumeText.match(skillsRegex);
  if (skillsMatch) {
    const skillsString = skillsMatch[1];
    // Split the skills string into an array using comma as the delimiter
    const skillsArray = skillsString.split(',').map(skill => skill.trim());
    return skillsArray;
  }
  return [];
}

// Route for handling file upload
app.post('/apply', upload.single('resume'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Here you can access the uploaded file using req.file
  const resumePath = req.file.path;

  // Perform file scanning using PDFExtract
  const pdfExtract = new PDFExtract();

  pdfExtract.extract(resumePath, {}, (err, data) => {
    if (err) {
      console.error('Error extracting PDF:', err);
      return res.status(500).send('Error extracting PDF.');
    }

    const { pages } = data;
    let textContent = '';

    // Concatenate text content from all pages
    pages.forEach((page) => {
      page.content.forEach((content) => {
        textContent += content.str + ' ';
      });
    });

   // Extract name and email from the resume content
    const nameRegex = /Name:\s+(.+)(?=\s+Email:)/i;
    const emailRegex = /Email:\s+(.+)(?=\s+Age:)/i;
    const ageRegex = /Age:\s+(.+)(?=\s+Education:)/i;

    const nameMatch = textContent.match(nameRegex);
    const emailMatch = textContent.match(emailRegex);
    const ageMatch = textContent.match(ageRegex);

    const name = nameMatch ? nameMatch[1].trim() : '';
    const email = emailMatch ? emailMatch[1].trim() : '';
    const age = ageMatch ? ageMatch[1].trim() : '';

    // Extract skills from the resume text
    const education = extracteducationFromResume(textContent);
    const experience = extractexperienceFromResume(textContent);
    const skills = extractlanguageFromResume(textContent);

    // Create a new Applicant document
    const newApplicant = new Applicant({
      name: name,
      email: email,
      age: age,
      education: education,
      experience: experience,
      language: skills,
      resume: req.file.path
    });

    // Save the new applicant to the database
    newApplicant
      .save()
      .then(() => {
        console.log('Applicant saved to the database');
        // Set a timeout of 3 seconds
        const redirectDelay = 3000;
        // Generate the script to display the alert after the timeout and redirect to the apply page
        const script = `
          <script>
            setTimeout(function() {
              alert('Thank you for uploading your resume!');
              window.location.href = '/apply';
            }, ${redirectDelay});
          </script>
        `;
        // Send the script as the response
        res.send(script);
      })
      .catch((err) => {
        console.log('Error saving applicant to the database:', err);
        res.status(500).send('An error occurred while saving the applicant.');
      });
  });
});

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
