const express = require('express');
const fs = require('fs').promises; // Use async/await for file system
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());

const dbPath = path.join(__dirname, 'users.json');

// Function to read users from file
async function readUsersFromFile() {
    try {
        const data = await fs.readFile(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Return an empty array if the file doesn't exist
        return [];
    }
}

// Function to write users to file
async function writeUsersToFile(users) {
    await fs.writeFile(dbPath, JSON.stringify(users, null, 2), 'utf8');
}

// API endpoint to get all users
app.get('/api/users', async (req, res) => {
    const users = await readUsersFromFile();
    res.json(users);
});

// API endpoint to add a new user
app.post('/api/users', async (req, res) => {
    const newUserName = req.body.name;
    if (newUserName) {
        const users = await readUsersFromFile();
        const newUser = { id: Date.now(), name: newUserName };
        users.push(newUser);
        await writeUsersToFile(users);
        res.status(201).json(newUser);
    } else {
        res.status(400).send({ error: 'User name is required.' });
    }
});

// API endpoint to delete a user
app.delete('/api/users/:id', async (req, res) => {
    const userId = parseInt(req.params.id);
    let users = await readUsersFromFile();
    const initialUserCount = users.length;
    users = users.filter(user => user.id !== userId);

    if (users.length < initialUserCount) {
        await writeUsersToFile(users);
        res.status(200).send({ message: 'User deleted successfully.' });
    } else {
        res.status(404).send({ error: 'User not found.' });
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
