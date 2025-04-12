const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// POST: /login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Received login request:', username, password); // ✅ log inputs

    fs.readFile(path.join(__dirname, 'public/data/users.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading users.json:', err);
            return res.status(500).send({ success: false, message: 'Server error' });
        }

        const users = JSON.parse(data);
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            console.log('Login successful!');
            res.send({ success: true });
        } else {
            console.log('Login failed: Invalid credentials');
            res.status(401).send({ success: false, message: 'Invalid credentials' });
        }
    });
});


// GET: /main
app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/main.html'));
});

// GET: /courses
app.get('/courses', (req, res) => {
    const { name, category } = req.query;
    fs.readFile(path.join(__dirname, 'public/data/courses.json'), 'utf8', (err, data) => {
        if (err) return res.status(500).send({ success: false, message: 'Server error' });

        let courses = JSON.parse(data);
        if (name || category) {
            courses = courses.filter(course => {
                return (!name || course.name.toLowerCase().includes(name.toLowerCase())) &&
                       (!category || course.category.toLowerCase().includes(category.toLowerCase()));
            });
        }

        res.send({ success: true, courses });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
