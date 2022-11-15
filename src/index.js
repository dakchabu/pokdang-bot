Promise = require('bluebird')
const app = require('./config/express')
const { port } = require('./config/vars')

app.listen(port, () => console.log(`server started on port ${port}`))

/**
 * Exports express
 * @public
 */
module.exports = app
