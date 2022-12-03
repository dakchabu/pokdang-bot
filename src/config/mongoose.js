const mongoose = require('mongoose')
const { mongoURI } = require('./vars')

const options = {
  keepAlive: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
}

// set mongoose Promise to Bluebird
// mongoose.Promise = Promise

// Exit application on error
mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err}`)
  process.exit(-1)
})

/**
 * Connect to mongo db
 *
 * @returns {object} Mongoose connection
 * @public
 */

mongoose.main = mongoose.createConnection(mongoURI, options)

module.exports = mongoose
