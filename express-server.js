const express = require('express');
require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { connectDB, getCollection } = require('./server/db.cjs');
const { ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));
app.use(express.static('views'));
app.use(express.json());

// ----- Session Startup -----
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true } // HTTPS required on Render
}));

app.use(passport.initialize());
app.use(passport.session());

// ----- Database ------
let tasksCollection; // Make it global so routes can access it
let usersCollection;

async function startServer() {
  try {
    const db = await connectDB();
    tasksCollection = getCollection("tasks-collection");
    usersCollection = getCollection("users-collection");

    app.listen(port, () => {
      console.log(`Server running at port:${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

function calculateDaysLeft(taskDueDate) {
  const dueDate = new Date(taskDueDate);
  const today = new Date();
  return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
}

function requireLogin(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: "User not authenticated" });
  }
  next();
}

// ----- Passport Strategy -----

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "https://a3-ericli.onrender.com/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await usersCollection.findOne({ githubId: profile.id });
    if (!user) {
      const result = await usersCollection.insertOne({
        githubId: profile.id,
        username: profile.username
      });
      user = await usersCollection.findOne({ _id: result.insertedId });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// ----- Auth Routes -----

app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/'); // Redirect to homepage after successful login
  });

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

app.get('/me', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ user: null });
  res.json({ user: { username: req.user.username } });
});

// ----- API Routes -----

app.get('/todos', requireLogin, async (req, res) => {
  try {
    const todos = await tasksCollection.find({}).toArray();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Routes
app.post("/submit", requireLogin, async (req, res) => {
  try {
    const todo = req.body;
    todo.daysLeft = calculateDaysLeft(todo.taskDueDate);
    await tasksCollection.insertOne(todo);

    const todos = await tasksCollection.find({}).toArray();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/delete', requireLogin, async (req, res) => {
  try {
    const { id } = req.query;
    await tasksCollection.deleteOne({ _id: new ObjectId(id) });

    const todos = await tasksCollection.find({}).toArray();
    res.json(todos); // send updated list
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/toggle', requireLogin, async (req, res) => {
  const { id, completed } = req.body;
  await tasksCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { completed } }
  );

  const todos = await tasksCollection.find({}).toArray();
  res.json(todos);
});

app.post('/edit', requireLogin, async (req, res) => {
  const { id, taskTitle, taskDescription, taskDueDate } = req.body;
  await tasksCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { taskTitle, taskDescription, taskDueDate } }
  );

  const todos = await tasksCollection.find({}).toArray();
  res.json(todos);
});

startServer();
