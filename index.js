require('dotenv').config()
const Contact = require('./models/contact')

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

const PORT = process.env.PORT

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('content', (request) => {
  const body = request.body
  return JSON.stringify(body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'))

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    response.status(500).send({ messsage: error.message })
  } else if (error.name === 'ValidationError') {
    response.status(500).send({ message: error.message })
  }

  next(error)
}


app.get('/', (request, response) => {
  response.send('<h1>Persons</h1>')
})

app.get('/api/persons', (request, response) => {
  Contact.find({}).then(res => response.json(res))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const contact = new Contact({
    name: body.name,
    number: body.number
  })

  contact.save().then(
    (savedNote) => {
      response.json(savedNote)
    }
  ).catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  const dateTime = new Date()

  Contact.countDocuments({})
    .then((count) => {
      const result =
            `
            <p>Phonebook has info for ${count} people</p>
            <p>${dateTime.toString()}</p>
            `
      response.send(result)
    }).catch((err) => {
      next(err)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Contact.findById(request.params.id)
    .then(res => {
      if (res) {
        response.json(res)
      } else {
        response.status(404).end(`${id} not found`)
      }
    })
    .catch(error => {
      next(error)
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  const  body = request.body
  const id = request.params.id
  const newContact = {
    name: body.name,
    number: body.number
  }

  Contact.findByIdAndUpdate(id, newContact, { new: true, runValidators: true }).then(res => {
    if (res) {
      response.json(res)
    } else {
      response.status(404).end(`${id} not found`)
    }
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', async (request, response, next) => {
  const id = request.params.id
  Contact.findByIdAndDelete(id).then(
    deletion => {
      if (deletion) {
        response.json(`deleted ${id}`)
      } else {
        response.status(404).end(`${id} not found`)
      }
    }
  ).catch(error => next(error))
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server runs on ${PORT}`)
})