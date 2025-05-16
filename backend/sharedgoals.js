const express = require('express'); //web framework for Node.js
const cors = require('cors'); //for frontend and backend communication
const PORT = 1010; //http://localhost:1010

const app = express();
app.use(cors());
app.use(express.json());

let goals = [];

app.get('/api/goals', (req, res) => {
  res.json(goals);
});

app.post('/api/goals', (req, res) => {
  const { description, amount, createdBy, splitBetween } = req.body;

  if (!Array.isArray(splitBetween) || splitBetween.length === 0) {
    return res.status(400).json({ error: 'splitBetween must have values' });
  }

  if (!splitBetween.includes(createdBy)) {
    splitBetween.push(createdBy);
  }

  const total = parseFloat(amount);
  const perPerson = parseFloat((total / splitBetween.length).toFixed(2));

  const splitDetails = splitBetween.map(person => ({
    name: person,
    owesTo: 'goal',
    amount: perPerson,
    contributed: 0
  }));

  const newGoal = {
    id: Date.now(),
    description,
    amount: total,
    createdBy,
    splitBetween,
    splitDetails,
    createdAt: new Date()
  };

  goals.push(newGoal);
  res.status(201).json(newGoal);
});

app.patch('/api/goals/:id/contribute/:name', (req, res) => {
  const id = parseInt(req.params.id);
  const name = req.params.name;
  const { amount } = req.body;

  const goal = goals.find(g => g.id === id);
  if (!goal) return res.status(404).json({ error: 'Goal not found' });

  const person = goal.splitDetails.find(p => p.name === name);
  if (!person) return res.status(404).json({ error: 'Person not found in goal' });

  person.contributed += parseFloat(amount);
  res.json({
    message: 'Contribution updated',
    updatedSplitDetails: goal.splitDetails
  });
});

//testing purposes
app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
});


app.delete('/api/goals', (req, res) => {
  goals = [];
  res.send({ message: 'All goals deleted' });
});
