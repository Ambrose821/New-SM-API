const mongoose = require('mongodb')

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      /*Optional configurations*/
    })
  } catch (err) {
    console.error('connectDB error: ' + err)
  }
}

module.exports = { connectDB }