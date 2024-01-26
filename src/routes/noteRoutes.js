const express = require('express');
const noteController = require('../controllers/noteController');

const router = express.Router();


router.get('/add', (req, res) => {

    res.render('addNote');
});

router.get('/note', (req, res) => {
    const jsonData = {
        auth: { name: "test", password: "test" },
        note: { text: "aa", command: "aaa" }
    };
    res.render('note', { note: jsonData});
});


router.post('/add', noteController.addNote);
router.post('/readFile', noteController.readFile);
router.post('/deleteFile', noteController.deleteFile);


module.exports = router;
