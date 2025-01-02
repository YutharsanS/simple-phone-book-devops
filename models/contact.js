require('dotenv').config()
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI
console.log(`connecting to ${url}`)

const numericValidator = (number) => {
  return /^\d+$/.test(number)
}

const numberValidator = (number) => {

  if (number.includes('-')) {
    const [prefix, suffix] = number.split('-')
    console.log(prefix)
    return (prefix.length === 2 || prefix.length === 3) && numericValidator(prefix) && numericValidator(suffix)
  }

  return false
}

const custom = [numberValidator, 'Number is not in the valid format']

mongoose.connect(url)
  .then(() => { console.log('Connected to MongoDB') })
  .catch (error => {
    console.log('error connecting to MongoDB', error)
  })

const noteSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'name is required'], unique: true, minLength: 3 },
    number: { type: String, required: [true, 'number is required'], minLength: 8 , validate: custom },
  }
)

noteSchema.set('toJSON', {
  transform: (document, output) => {
    output.id = document._id.toString()
    delete output._id
    delete output.__v
  }
})

module.exports = mongoose.model('Contact', noteSchema)