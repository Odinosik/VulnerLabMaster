const express = require('express');
const router = express.Router();


const userController = require('../controllers/profileController');

router.get('/profile', userController.getProfile);
router.get('/profile/:filename',userController.getFile);

router.get('/authorize', userController.getAuthorize);
module.exports = router;