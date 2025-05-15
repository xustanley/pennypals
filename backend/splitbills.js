const express = require('express'); //web framework for Node.js
const cors = require('cors'); //for frontend and backend communication
const PORT = 5050; //http://localhost:5050

const app = express();
app.use(cors());
app.use(express.json());

let bills = [];

//testing purposes
app.get('/', (req, res) => {
    res.send('Welcome to the Split Bills API');
});

//get
app.get('/api/bills', (req, res) => {
    res.json(bills);
});

//post
app.post('/api/bills', (req, res) => {
    // reminder: splitBetween needs to be implemented as an array in frontend
    const {description, amount, paidBy, splitBetween } = req.body;

    //should check this in front end too
    if(!Array.isArray(splitBetween) || splitBetween.length === 0) {
        return res.status(400).json({ error: 'splitBetween must have values' });
    }

    //includes person who paid
    if(!splitBetween.includes(paidBy)) {
        splitBetween.push(paidBy);
    }
    const total = parseFloat(amount);
    const numOfPeople = splitBetween.length;
    const amountPerPerson = parseFloat((total / numOfPeople).toFixed(2)); //round to 2 decimal places

    const splitDetails = splitBetween.filter(person => person !== paidBy)
        .map(person => ({
            name: person,
            owesTo: paidBy,
            amount: amountPerPerson,
            status: 'pending'
        }));
    const newBill = {
        id: Date.now(),
        description,
        amount: total,
        paidBy,
        splitBetween,
        splitDetails,
        createdAt: new Date()
    };

    //adds new bill
    bills.push(newBill);
    res.status(201).json(newBill);
});

//patch
app.patch('/api/bills/:id/pay/:name', (req, res) => {
    const id = parseInt(req.params.id);
    const name = req.params.name;
    const bill = bills.find(bill => bill.id === id);
    if (!bill) {
        return res.status(404).json({ error: 'Bill not found' });
    }
    const person = bill.splitDetails.find(person => person.name === name);
    if (!person) {
        return res.status(404).json({ error: 'Person not found' });
    }
    person.status = 'paid';
    res.json({
        message: 'Payment status updated',
        updatedSplitDetails: bill.splitDetails
    });
});

app.listen(PORT, () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);
});
