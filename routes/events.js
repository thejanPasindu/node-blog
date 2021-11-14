const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const checkIsInRole = require('../utils/auth');

var path = require('path');
var fs = require('fs');

var multer = require('multer');
var upload = multer({ dest: path.join(__dirname + '/uploads/') });

const ObjectId = require('mongoose').Types.ObjectId;

const { ROLES, EVENT_CATEGORIES } = require('../utils/enums');

// sending mails
const nodemailer = require('nodemailer');
const Handlebars = require('handlebars');
var source = fs.readFileSync(path.join(__dirname, 'template.hbs'), 'utf8');
var template = Handlebars.compile(source);
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '#',
    pass: '#'
  }
});

// Load Event model
const Event = require('../models/Event');
const User = require('../models/User');


// view add event page
router.get('/add-event', ensureAuthenticated, checkIsInRole(ROLES.Organizer), (req, res) =>
  res.render('components/add_event', {
    categories: Object.values(EVENT_CATEGORIES), category: EVENT_CATEGORIES.Sport, selectNav: 'addevent'
  })
);


// add event to the database
router.post('/add-event', upload.array('uploaded_file', 3), ensureAuthenticated, (req, res) => {
  const { name, category, description, place, date, time } = req.body;
  let errors = [];

  if (!name || !category || !description || !place || !date || !time) {
    errors.push({ msg: 'Please fill all fields' });
  }

  let dateTime = new Date(date + 'T' + time + 'Z')
  if (dateTime < new Date()) {
    errors.push({ msg: 'Incorrect Date Time !' });
  }

  if (errors.length > 0) {
    res.render('components/add_event', { errors, name, category, description, place, date, time, categories: Object.values(EVENT_CATEGORIES) });
  }
  else {
    let picture = [];

    // User.findOne({ _id: new ObjectId(req.user._id)}).then(user => console.log("user:", user));

    req.files.forEach(file => {
      const img = {
        data: fs.readFileSync(path.join(__dirname + '/uploads/' + file.filename)),
        contentType: 'image/png'
      }
      picture.push(img);
    });

    const newEvent = new Event({ name, category, description, place, picture, datetime: dateTime, organiser: req.user.email });

    newEvent.save()
      .then(event => {
        res.render('components/add_event', {
          categories: Object.values(EVENT_CATEGORIES),
          category: EVENT_CATEGORIES.Sport,
          success: "Event has been published"
        })
      })
      .catch(err => console.log(err));
  }

});


// view event list
router.get('/my-events', ensureAuthenticated, checkIsInRole(ROLES.Organizer), (req, res) => {
  Event.find({ organiser: req.user.email }).then(evs => {
    res.render('components/my_events', { events: evs, selectNav: 'myevent' });
  });
});


// view edit event
router.get('/edit-event/:id', ensureAuthenticated, checkIsInRole(ROLES.Organizer), (req, res) => {
  Event.findOne({ _id: new ObjectId(req.params['id']) }).then(evs => {
    const { _id, name, category, description, place, datetime, picture } = evs;
    res.render('components/edit_event', {
      categories: Object.values(EVENT_CATEGORIES),
      _id, name, category, description, place, date: datetime.toLocaleDateString("sv-SE"), time: datetime.toLocaleTimeString("en-GB"), picture
    });
  });
});


// edit event
router.post('/edit-event', ensureAuthenticated, async (req, res) => {
  const { _id, name, category, description, place, date, time } = req.body;
  let errors = [];

  await Event.findOne({ _id: new ObjectId(_id) }).then(data => {
    if (data.organiser == req.user.email) {
      if (!_id || !name || !category || !description || !place || !date || !time) {
        errors.push({ msg: 'Please fill all fields' });
      }

      let dateTime = new Date(date + 'T' + time + 'Z')
      if (dateTime < new Date()) {
        errors.push({ msg: 'Incorrect Date Time !' });
      }

      if (errors.length > 0) {
        res.render('components/edit_event', { errors, _id, name, category, description, place, date, time, categories: Object.values(EVENT_CATEGORIES) });
      }
      else {
        const newEvent = { name, category, description, place, datetime: dateTime };
        Event.findOneAndUpdate({ _id: new ObjectId(_id) }, newEvent, function (err, result) {
          if (err) {
            req.flash('error_msg', 'Something went wrong !');
          }
          else {
            req.flash('success_msg', 'Successfully Updated !');
          }
          res.redirect('/events/my-events');
        });
      }
    } else {
      req.flash('error_msg', 'Unauthorized !');
      res.redirect('/events/my-events');
    }
  }).catch(err => {
    req.flash('error_msg', 'Unauthorized !');
    res.redirect('/events/my-events');
  });

});


// delete event
router.get('/delete-event/:id', ensureAuthenticated, checkIsInRole(ROLES.Organizer), (req, res) => {
  const _id = req.params["id"];
  Event.findOne({ _id: new ObjectId(_id) }).then(data => {
    if (data.organiser == req.user.email) {
      Event.findOneAndDelete({ _id: new ObjectId(_id) }, function (err, result) {
        if (err) {
          req.flash('error_msg', 'Something went wrong !');
        }
        else {
          req.flash('success_msg', 'Successfully Deleted !');
        }
        res.redirect('/events/my-events');
      });
    } else {
      req.flash('error_msg', 'Unauthorized !');
      res.redirect('/events/my-events');
    }
  }).catch(err => {
    console.log(err);
    req.flash('error_msg', 'Unauthorized !');
    res.redirect('/events/my-events');
  });

});

// view event
router.get('/view-event/:id', (req, res) => {
  Event.findOne({ _id: new ObjectId(req.params['id']) }).then(event => {
    User.findOne({ email: event.organiser }).then(user => {
      organiser = { name: user.name, email: user.email, phone: user.phone };
      res.render('components/view_event', {
        event, organiser
      });
    });
  });
});


// add rank for event
router.get('/add-rank/:id', (req, res) => {
  Event.findOneAndUpdate({ _id: new ObjectId(req.params["id"]) }, { $inc: { 'rank': 1 } }, function (err, result) {
    if (err) {
      res.redirect('/events/view-event/' + req.params["id"]);
    }
    else {
      res.redirect('/events/view-event/' + req.params["id"]);
    }
  });
});

// remove rank for event
router.get('/remove-rank/:id', (req, res) => {
  Event.findOneAndUpdate({ _id: new ObjectId(req.params["id"]) }, { $inc: { 'rank': -1 } }, function (err, result) {
    if (err) {
      res.redirect('/events/view-event/' + req.params["id"]);
    }
    else {
      res.redirect('/events/view-event/' + req.params["id"]);
    }
  });
});

// send mail to event organiser
router.post('/send-mail', (req, res) => {
  const { event_id, name, email, msg } = req.body;
  let errors = [];

  if (!event_id || !name || !email || !msg) {
    req.flash('error_msg', 'Please fill all fields');
    errors.push({ msg: 'Please fill all fields' });
  }
  var emailRegex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  if (!emailRegex.test(email)) {
    req.flash('error', 'Invalid Email');
    errors.push({ msg: 'Invalid Email !' });
  }


  if (errors.length > 0) {
    res.redirect('/events/view-event/' + event_id);
  } else {
    Event.findOne({ _id: new ObjectId(event_id) }).then(event => {
      const mailOptions = {
        from: 'ptlabsinfo@gmail.com',
        to: event.organiser,
        subject: `Aston University Event Management System | ${event.name}`,
        html: template({ message: msg, subject: `This mail from ${name} regarding ${event.name}`, sender: name })
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          req.flash('error_msg','Something went wrong, please try again !');
        } else {
          console.log('Email sent: ' + info.response);
          req.flash('success_msg', 'Email Sent !');
        }
        res.redirect('/events/view-event/' + event_id);
      });
    });
  }

});

module.exports = router;