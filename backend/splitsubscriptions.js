const express = require('express');
const cors = require('cors');
const PORT = 9090;

const app = express();
app.use(cors());
app.use(express.json());

let subscriptions = [];

// again, testing purposes
app.get('/', (req, res) => {
    res.send('Welcome to the Shared Subscriptions API');
});

// GET all subscriptions
app.get('/api/subscriptions', (req, res) => {
    res.json(subscriptions);
});

// POST a new subscription
app.post('/api/subscriptions', (req, res) => {
    const { serviceName, monthlyCost, subscribedBy, splitBetween } = req.body;

    if (!Array.isArray(splitBetween) || splitBetween.length === 0) {
        return res.status(400).json({ error: 'splitBetween must have values' });
    }

    // Ensure subscriber is included
    if (!splitBetween.includes(subscribedBy)) {
        splitBetween.push(subscribedBy);
    }

    // Calculate individual costs
    const total = parseFloat(monthlyCost);
    const perPerson = parseFloat((total / splitBetween.length).toFixed(2));

    const splitDetails = splitBetween
        .filter(person => person !== subscribedBy)
        .map(person => ({
            name: person,
            owesTo: subscribedBy,
            amount: perPerson,
            status: 'pending'
        }));

    const newSubscription = {
        id: Date.now(),
        serviceName,
        monthlyCost: total,
        subscribedBy,
        splitBetween,
        splitDetails,
        createdAt: new Date()
    };

    subscriptions.push(newSubscription);
    res.status(201).json(newSubscription);
});

// PATCH to mark payment for a user
app.patch('/api/subscriptions/:id/pay/:name', (req, res) => {
    const id = parseInt(req.params.id);
    const name = req.params.name;

    const subscription = subscriptions.find(sub => sub.id === id);
    if (!subscription) {
        return res.status(404).json({ error: 'Subscription not found' });
    }

    const person = subscription.splitDetails.find(p => p.name === name);
    if (!person) {
        return res.status(404).json({ error: 'Person not found in splitDetails' });
    }

    person.status = 'paid';

    res.json({
        message: 'Payment status updated',
        updatedSplitDetails: subscription.splitDetails
    });
});

app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
});
