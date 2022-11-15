const express = require('express')
const { test, LineBot } = require('../controllers/controller');
const router = express.Router()

router.route('/test')
  .post(test)

router.route('/bot')
  .post(LineBot)

module.exports = router