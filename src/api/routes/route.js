const express = require('express');
const { LineBot } = require('../controllers/controller');
const router = express.Router();

router.route('/bot')
  .post(LineBot)

module.exports = router;