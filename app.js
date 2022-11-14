/* eslint-disable */
const serverless = require('serverless-http')
const app = require('./src/config/express')
const handler = serverless(app)

module.exports.server = async (event, context) => {
  return await handler(event, context)
}
