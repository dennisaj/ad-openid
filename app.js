/**
 * Copyright (c) Microsoft Corporation
 *  All Rights Reserved
 *  Apache License 2.0
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @flow
 */

'use strict';

/**
 * Module dependencies.
 */

var express = require('express');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var passport = require('passport');
var util = require('util');
var bunyan = require('bunyan');
var config = require('./config');

// Start QuickStart here 
// 
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

// Add some logging
var log = bunyan.createLogger({
    name: 'Microsoft OIDC Example Web Application'
});

// Passport session setup. (Section 2)
// 
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.

passport.serializeUser(function (user, done) {
    done(null, user.email);
});

passport.deserializeUser(function (id, done) {
    findByEmail(id, function (err, user) {
        done(err, user);
    });
});

// Array to hold signed-in users
var users = [];

var findByEmail = function (email, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        log.info('we are using user: ', user);
        if (user.email === email) {
            return fn(null, user);
        }
    }
    return fn(null, null);
};


// Use the OIDCStrategy within Passport (section 2)
//
//   Strategies in Passport require a `validate` function. The function accepts
//   credentials (in this case, an OpenID identifier), and invokes a callback
//   with a user object.

passport.use(new OIDCStrategy({
        identityMetadata: config.creds.identityMetadata,
        clientID: config.creds.clientID,
        responseType: config.creds.responseType,
        responseMode: config.creds.responseMode,
        redirectUrl: config.creds.redirectUrl,
        allowHttpForRedirectUrl: true,
        clientSecret: config.creds.clientSecret,
        validateIssuer: false,
        isB2C: false,
        issuer: null,
        passReqToCallback: false,
        scope: config.creds.scope,
        useCookieInsteadOfSession: config.creds.useCookieInsteadOfSession,  // use cookie, not session
        cookieEncryptionKeys: config.creds.cookieEncryptionKeys,
        loggingLevel: 'info'
    },
    function (iss, sub, profile, accessToken, refreshToken, done) {
        log.info('Example: Email address we received was: ', profile.email);
        // Asynchronous verification, for effect...
        process.nextTick(function () {
            findByEmail(profile.email, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    // "Auto-registration"
                    users.push(profile);
                    return done(null, profile);
                }
                return done(null, user);
            });
        });
    })
);

// Set up Express (section 2)

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.logger());
app.use(methodOverride());
app.use(cookieParser());

app.use(expressSession({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: false
}));

app.use(bodyParser.urlencoded({
    extended: true
}));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(__dirname + '/../../public'));

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Routes (Section 4)
app.get('/', function (req, res) {
    res.render('index', {
        user: req.user
    });
});

app.get('/account', ensureAuthenticated, function (req, res) {
    res.render('account', {
        user: req.user
    });
});

app.get('/login', function(req, res, next) {
    passport.authenticate('azuread-openidconnect', 
        { 
            session: false,
            resourceURL: config.resourceURL,
            failureRedirect: '/' 
        })(req, res, next);
    }, function(req, res) {
        log.info('Login was called in the Sample');
        res.redirect('/');
    });

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

// Auth routes (section 3)

// POST /auth/openid/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request. If authentication fails, the user is redirected back to the
//   sign-in page. Otherwise, the primary route function is called. 
//   In this example, it redirects the user to the home page.
// 'POST returnURL'
// `passport.authenticate` will try to authenticate the content returned in
// body (such as authorization code). If authentication fails, user will be
// redirected to '/' (home page); otherwise, it passes to the next middleware.
app.post('/auth/openid/return',
function(req, res, next) {
  passport.authenticate('azuread-openidconnect', 
    { 
      response: res,                      // required
      failureRedirect: '/'  
    }
  )(req, res, next);
},
function(req, res) {
  log.info('We received a return from AzureAD.');
  res.redirect('/');
});

// 'GET returnURL'
// `passport.authenticate` will try to authenticate the content returned in
// query (such as authorization code). If authentication fails, user will be
// redirected to '/' (home page); otherwise, it passes to the next middleware.
app.get('/auth/openid/return',
function(req, res, next) {
  passport.authenticate('azuread-openidconnect', 
    { 
      response: res,                      // required
      failureRedirect: '/'  
    }
  )(req, res, next);
},
function(req, res) {
  log.info('We received a return from AzureAD.');
  res.redirect('/');
});

app.listen(3000);