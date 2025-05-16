const express = require('express');
const cors = require('cors');
const PORT = 5050;

const app = express();
app.use(cors());
app.use(express.json());

let expenses = [];

// Home route for testing
app.get('/', (req, res) => {
    res.send('Welcome to the Shared Expenses API');
});

// GET all expenses
app.get('/api/expenses', (req, res) => {
    const { type } = req.query;
    const filtered = type ? expenses.filter(e => e.type === type) : expenses;
    res.json(filtered);
});

// POST a new expense
app.post('/api/expenses', (req, res) => {
    const { type, title, amount, paidBy, splitBetween } = req.body;

    if (!type || !['bill', 'subscription'].includes(type)) {
        return res.status(400).json({ error: 'Type must be "bill" or "subscription"' });
    }

    if (!Array.isArray(splitBetween) || splitBetween.length === 0) {
        return res.status(400).json({ error: 'splitBetween must have values' });
    }

    if (!splitBetween.includes(paidBy)) {
        splitBetween.push(paidBy);
    }

    const total = parseFloat(amount);
    const perPerson = parseFloat((total / splitBetween.length).toFixed(2));

    const splitDetails = splitBetween
        .filter(person => person !== paidBy)
        .map(person => ({
            name: person,
            owesTo: paidBy,
            amount: perPerson,
            status: 'pending'
        }));

    const newExpense = {
        id: Date.now(),
        type,                 // 'bill' or 'subscription'
        title,           
        amount: total,
        paidBy,
        splitBetween,
        splitDetails,
        createdAt: new Date()
    };

    expenses.push(newExpense);
    res.status(201).json(newExpense);
});

// PATCH one person is paid for a specific expense
app.patch('/api/expenses/:id/pay/:name', (req, res) => {
    const id = parseInt(req.params.id);
    const name = req.params.name;

    const expense = expenses.find(e => e.id === id);
    if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
    }

    const person = expense.splitDetails.find(p => p.name === name);
    if (!person) {
        return res.status(404).json({ error: 'Person not found in splitDetails' });
    }

    person.status = 'paid';

    res.json({
        message: 'Payment status updated',
        updatedSplitDetails: expense.splitDetails
    });
});

app.listen(PORT, () => {
    console.log(`✅ Unified backend running at http://localhost:${PORT}`);
});

//testing purposes
app.delete('/api/expenses', (req, res) => {
  expenses = [];
  res.send({ message: 'All expenses deleted' });
});

