const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');
const User = require('../models/User');

// Welcome page
router.get('/', ensureAuthenticated, (req, res) => res.render('home'));

// Dashboard page
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  User.find({})
    .then(users => {
      res.render('dashboard', {
        name: req.user.name,
        users: users || [] // Pass the users data to the view or an empty array if it's undefined
      });
    })
    .catch(err => {
      console.error(err);
      res.render('error/500');
    });
});

// About Us page
router.get('/about', ensureAuthenticated, (req, res) => {
  res.render('about');
});

// Careers page
router.get('/careers', ensureAuthenticated, (req, res) => {
  res.render('careers');
});

// Apply page
router.get('/apply', ensureAuthenticated, (req, res) => {
  res.render('apply');
});

module.exports = router;
