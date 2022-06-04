const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://fullstack:${password}@cluster0.huruv.mongodb.net/phonebookApp?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  mongoose
    .connect(url)
    .then(() => {
      console.log('phonebook:')
      Person
        .find({})
        .then(result => {
          result.forEach(person => console.log(`${person.name} ${person.number}`))
          return mongoose.connection.close()
        })
    })
    .catch(err => console.log(err))
}

if (process.argv.length === 5) {
  mongoose
    .connect(url)
    .then(() => {
      const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
      })
      return person
        .save()
        .then(result => {
          console.log(`added ${result.name} number ${result.number} to phonebook`)
        })
    })
    .then(() => mongoose.connection.close())
    .catch(err => console.log(err))
}


