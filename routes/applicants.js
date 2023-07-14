const Applicant = require('../models/Applicant');

// Route handler to render applicant details
app.get('/applicants/:id', (req, res) => {
  const applicantId = req.params.id;

  Applicant.findById(applicantId)
    .then((applicant) => {
      res.render('applicant-details', { applicant });
    })
    .catch((err) => {
      // Handle error
      console.error(err);
      res.redirect('/apply'); // Redirect to homepage or error page
    });
});
