const express = require('express');
const { connectDB, getCollection } = require('./server/db.cjs');
const { ObjectId } = require('mongodb');

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(express.static('views'));

let tasksCollection;

async function initDB() {
  if (!tasksCollection) {
    await connectDB();
    tasksCollection = getCollection('tasks-collection');
  }
}

function calculateDaysLeft(taskDueDate) {
  const dueDate = new Date(taskDueDate);
  const today = new Date();
  return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
}

// Routes
app.get('/todos', async (req, res) => {
  await initDB();
  const todos = await tasksCollection.find({}).toArray();
  res.json(todos);
});

app.post('/submit', async (req, res) => {
  await initDB();
  const todo = req.body;
  todo.daysLeft = calculateDaysLeft(todo.taskDueDate);
  await tasksCollection.insertOne(todo);
  const todos = await tasksCollection.find({}).toArray();
  res.json(todos);
});

app.delete('/delete', async (req, res) => {
  await initDB();
  const { id } = req.query;
  await tasksCollection.deleteOne({ _id: new ObjectId(id) });
  const todos = await tasksCollection.find({}).toArray();
  res.json(todos);
});

app.post('/toggle', async (req, res) => {
  await initDB();
  const { id, completed } = req.body;
  await tasksCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { completed } }
  );
  const todos = await tasksCollection.find({}).toArray();
  res.json(todos);
});

app.post('/edit', async (req, res) => {
  await initDB();
  const { id, taskTitle, taskDescription, taskDueDate } = req.body;
  await tasksCollection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { taskTitle, taskDescription, taskDueDate } }
  );
  const todos = await tasksCollection.find({}).toArray();
  res.json(todos);
});

// Export the app for Vercel serverless
module.exports = app;
