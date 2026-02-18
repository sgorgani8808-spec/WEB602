var express = require('express');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

var db = require('./db');

// Passport Local Strategy
passport.use(
  new Strategy(function (username, password, cb) {
    db.users.findByUsername(username, function (err, user) {
      if (err) return cb(err);
      if (!user) return cb(null, false);
      if (user.password != password) return cb(null, false);
      return cb(null, user);
    });
  })
);

// Session persistence
passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
});

// App setup
var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({ extended: true }));

app.use(
  require('express-session')({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', function (req, res) {
  res.render('home', { user: req.user });
});

app.get('/home', ensureLoggedIn('/login'), function (req, res) {
  res.render('home', { user: req.user });
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.post(
  '/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/home');
  }
);

// ✅ FIXED Logout (works with passport 0.4 and also clears session)
app.get('/logout', function (req, res, next) {
  try {
    // passport 0.4
    req.logout();
  } catch (e) {
    // passport 0.6+
    return req.logout(function (err) {
      if (err) return next(err);
      req.session.destroy(function () {
        res.clearCookie('connect.sid');
        return res.redirect('/');
      });
    });
  }

  // Destroy session for clean logout
  req.session.destroy(function () {
    res.clearCookie('connect.sid');
    return res.redirect('/');
  });
});

// Start server
app.listen(3000, function () {
  console.log('Server running at http://localhost:3000');
});