require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.static('build'))
app.use(express.json())

const Person = require('./models/person')
const { response } = require('express')

morgan.token('data', (request, response) => request.method !== 'POST' ? '' : JSON.stringify(request.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

app.get('/api/persons', (request, response, next) => {
  Person
    .find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Person
    .find({})
    .then(persons => {
      const message = `<p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>`
      response.send(message)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person
  .findById(request.params.id)
  .then(person => {
    response.json(person)
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body

  if (!name || !number) {
    return response.status(400).json({
      error: "name or number missing"
    })
  }

  const person = new Person({ name, number })

  Person
    .find({ name })
    .then(returnedList => {
      if (returnedList.length) {
        return response.status(400).json({
          error: 'name already saved'
        })
      }
      person
        .save()
        .then(returnedPerson => {
          response.json(returnedPerson)
        })
        .catch(error => next(error))
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person
    .findByIdAndUpdate(
      request.params.id,
      { name, number },
      { new: true, runValidators: true, context:'query' })
    .then(returnedPerson => {
      response.json(returnedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint'})
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id'})
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message})
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})