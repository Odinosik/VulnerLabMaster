const express = require('express');
const router = express.Router();
const userController = require('../controllers/mongoController');

router.get('/login', (req, res) => {
     /* 
 #swagger.tags = ['NoSQL Injection']
 #swagger.summary = 'Login to server'
 #swagger.consumes = ['application/json']
 #swagger.produces = ['application/json']
  */
    res.render('login');
});
router.post('/login', userController.login);

router.get('/search', (req, res) => {
         /* 
 #swagger.tags = ['NoSQL Injection']
 #swagger.summary = 'Get Search page'
 #swagger.consumes = ['application/json']
 #swagger.produces = ['application/json']
  */
    res.render('search');
});

router.post('/search', userController.search);

router.get('/track', userController.track);

module.exports = router;
