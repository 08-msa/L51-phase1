const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();

const adminRoutes = require('./route/adminRoutes');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/admin', adminRoutes);

// POST /login - Login endpoint
app.post('/login', (req, res) => {
    console.log('Received login request:', req.body); // Debug
  
    fs.readFile(path.join(__dirname, 'users.json'), 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading users file:', err);
        return res.status(500).send({ success: false, message: 'Server error' });
      }
      let users = JSON.parse(data);
      console.log('Users data:', users); // Debug
  
      const user = users.find(u => 
        u.username === req.body.username && 
        u.password === req.body.password
      );
  
      if (user) {
        console.log('Login success for user:', user.username); // Debug
        return res.send({ success: true, message: 'Login successful' });
      } else {
        console.log('Invalid credentials'); // Debug
        return res.status(401).send({ success: false, message: 'Invalid credentials' });
      }
    });
});

// GET /main - Main page route
app.get('/main', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});



app.get('/courses', (req, res) => {
    // Extract optional search parameters
    const searchName = req.query.name ? req.query.name.toLowerCase() : null;
    const searchCategory = req.query.category ? req.query.category.toLowerCase() : null;
    
    fs.readFile(path.join(__dirname, 'courses.json'), 'utf8', (err, data) => {
      if (err) {
         console.error('Error reading courses file:', err);
         return res.status(500).send({ success: false, message: 'Server error' });
      }
      let courses;
      try {
         courses = JSON.parse(data);
      } catch (parseErr) {
         console.error('Error parsing courses file:', parseErr);
         return res.status(500).send({ success: false, message: 'Server error' });
      }
      
      // If search parameters are provided, filter the courses
      if (searchName || searchCategory) {
        courses = courses.filter(course => {
           const matchesName = searchName ? course.name.toLowerCase().includes(searchName) : true;
           const matchesCategory = searchCategory ? course.category.toLowerCase().includes(searchCategory) : true;
           return matchesName && matchesCategory;
        });
      }
      
      res.send({ success: true, courses });
    });
  });
  

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

