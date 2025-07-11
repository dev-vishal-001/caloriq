// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { getHistoryByEmail } = require('../controllers/gethistory.controller');

router.get('/getHistory', getHistoryByEmail);

module.exports = router;
