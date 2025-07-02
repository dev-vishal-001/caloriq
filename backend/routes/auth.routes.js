// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { signIn } = require('../controllers/auth.controller');

router.post('/signin', signIn);

module.exports = router;
