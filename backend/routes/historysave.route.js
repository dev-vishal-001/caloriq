// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { createHistory } = require('../controllers/historysave.controller');

router.post('/createHistory', createHistory);

module.exports = router;
