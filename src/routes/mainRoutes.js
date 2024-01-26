const express = require('express');
const router = express.Router();

// Route to serve the index.html page
router.get('/', (req, res) => {
    res.render('index');
});

module.exports = router;