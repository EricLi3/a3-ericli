const express = require('express');
require('dotenv').config();
const { connectDB, getCollection } = require('./server/db.cjs');
const { ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

// Serve static files
app.use(express.static('public'));
app.use(express.static('views'));
app.use(express.json());

let tasksCollection; // Make it global so routes can access it

function calculateDaysLeft(taskDueDate) {
  const dueDate = new Date(taskDueDate);
  const today = new Date();
  return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
}

async function startServer() {
  try {
    const db = await connectDB();
    tasksCollection = getCollection("tasks-collection");

    app.listen(port, () => {
      console.log(`Server running at port:${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

app.get('/todos', async (req, res) => {
  try {
    const todos = await tasksCollection.find({}).toArray();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Routes
app.post("/submit", async (req, res) => {
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

app.delete('/delete', async (req, res) => {
  try {
    const { id } = req.query;
    await tasksCollection.deleteOne({ _id: new ObjectId(id) });

    const todos = await tasksCollection.find({}).toArray();
    res.json(todos); // send updated list
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/toggle', async (req, res) => {
  const { id, completed } = req.body;
  await tasksCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { completed } }
  );

  const todos = await tasksCollection.find({}).toArray();
  res.json(todos);
});

app.post('/edit', async (req, res) => {
  const { id, taskTitle, taskDescription, taskDueDate } = req.body;
  await tasksCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { taskTitle, taskDescription, taskDueDate } }
  );

  const todos = await tasksCollection.find({}).toArray();
  res.json(todos);
});

startServer();
