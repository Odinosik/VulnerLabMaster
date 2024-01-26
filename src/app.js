const express = require('express');
const mainRoutes = require('./routes/mainRoutes');
const noteRoutes = require('./routes/noteRoutes');
const mongoRoutes = require('./routes/mongoRoutes');
const profileRoutes = require('./routes/profileRoutes');

// app.js or server.js
const app = express();
const path = require('path');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../docs/swagger.json')

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(express.json());
app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', path.join(__dirname, 'views')); // Set the correct path for views
 // Middleware to parse JSON

app.use('/', mainRoutes);
app.use('/api/notes', noteRoutes); // Mounting the note routes
app.use('/api/mongo', mongoRoutes); // Mounting the note routes
app.use('/api/profile', profileRoutes); //Mounting the profile routes



module.exports = app;
