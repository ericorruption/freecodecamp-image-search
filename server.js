const { config } = require('dotenv')
const { get } = require('axios')
const express = require('express')

const RESULT_LIMIT = 10
const BING_API = 'https://api.cognitive.microsoft.com/bing/v7.0/'

config()

const connect = require('./db')
const app = express()

app.use(express.static('public'))

app.get('/searches', (req, res) => {
  connect.then(db => {
    db.collection('searches')
      .find({}, { _id: 0 })
      .sort({ createdAt: -1 })
      .limit(RESULT_LIMIT)
      .toArray()
      .then(results => res.send(results))
      .catch(console.error)
  })
})

const mapResult = ({ name, contentUrl, thumbnailUrl }) => ({ url: contentUrl, alt: name, thumbnail: thumbnailUrl })

app.get('/search', (req, res) => {
  const { q, offset = 0 } = req.query

  connect.then(db => {
    db.collection('searches')
      .insert({
        term: q,
        createdAt: new Date()
      })
      .then(result => {
        console.log(result)

        return get(`${BING_API}images/search?q=${q}&count=${RESULT_LIMIT}&offset=${offset}`, {
          headers: {
            'Ocp-Apim-Subscription-Key': process.env.BING_API_KEY
          }
        })
      })
      .then(response => response.data.value)
      .then(results => results.map(mapResult))
      .then(results => {
        res.send(results)
      })
      .catch(console.error)
  })
})

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
