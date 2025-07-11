const express = require('express');
const router = express.Router();
const { deleteHistoryById } = require('../controllers/deletehistory.controller');

router.post('/deleteHistory', deleteHistoryById);

module.exports = router;
