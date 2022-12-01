const path = require('path')

require('dotenv-safe').config({
  env: path.join(__dirname, '../../.env'),
  example: process.env.CI ? '.env.ci.example' : '.env.example',
})

module.exports = {
  port: process.env.PORT,
  mongoURI: process.env.MONGO_URI,
  channelAccessToken: process.env.LINE_TOKEN,
}
