Promise = require('bluebird')
// const logger = require('./config/logger')
const app = require('./config/express')
const port = process.env.PORT || 1234

app.listen(port, () => console.log(`server started on port ${port}`))

/**
 * Exports express
 * @public
 */
module.exports = app
