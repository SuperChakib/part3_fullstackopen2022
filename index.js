require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.static('build'))
app.use(express.json())

const Person = require('./models/person')

morgan.token('data', (request, response) => request.method !== 'POST' ? '' : JSON.stringify(request.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

app.get('/api/persons', (request, response) => {
  Person
    .find({})
    .then(persons => {
      response.json(persons)
    })
})

app.get('/info', (request, response) => {
  Person
    .find({})
    .then(persons => {
      const message = `<p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>`
      response.send(message)
    })
})

app.get('/api/persons/:id', (request, response) => {
  Person
  .findById(request.params.id)
  .then(person =>{
    response.json(person)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(p => p.id !== id)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name or number missing"
    })
  }
  
  const person = new Person({
    name: body.name,
    number: body.number
  })

  person
    .save()
    .then(returnedPerson => {
      response.json(returnedPerson)
    })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})