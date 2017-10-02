const { MongoClient } = require('mongodb')

const url = process.env.MONGODB_URI

const connection = MongoClient
  .connect(url)
  .catch(console.error)

module.exports = connection
