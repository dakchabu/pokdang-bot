const express = require('express')
const Routes = require('./route')
const app = express()

// app.use(express.static('public'))
// console.log('test')

module.exports = (app) => {
  app.get('/', (req, res) => {
    res.json({ message: 'API is connected! LOL' })
  })
  app.use(Routes)
}