const express = require('express');
const router = express.Router();
const { getCalories } = require('../controllers/calories.controller');

router.post('/getCalories', getCalories);

module.exports = router;
