const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const checkIsInRole = require('../utils/auth');

const {ROLES, EVENT_CATEGORIES} = require('../utils/enums');

// load models
const Event = require('../models/Event');

// Welcome Page
router.get('/', (req, res) => res.redirect('/dashboard'));

// Dashboard
router.get('/dashboard', (req, res) =>{
  Event.find({}).then(events =>{
    res.render('dashboard', {
      events, sortType: 'all'
    })
  })
});

// Dashboard rank
router.get('/dashboard/rank', (req, res) =>{
  Event.find({}).sort({'rank': "desc" }).then(events =>{
    res.render('dashboard', {
      events, sortType: 'rank'
    })
  })
});

// Dashboard sport
router.get('/dashboard/sport', (req, res) =>{
  Event.find({category: EVENT_CATEGORIES.Sport}).then(events =>{
    res.render('dashboard', {
      events, sortType: 'sport'
    })
  })
});

// Dashboard culture
router.get('/dashboard/culture', (req, res) =>{
  Event.find({category: EVENT_CATEGORIES.Culture}).then(events =>{
    res.render('dashboard', {
      events, sortType: 'culture'
    })
  })
});

// Dashboard other
router.get('/dashboard/other', (req, res) =>{
  Event.find({category: EVENT_CATEGORIES.Other}).then(events =>{
    res.render('dashboard', {
      events, sortType: 'other'
    })
  })
});

module.exports = router;