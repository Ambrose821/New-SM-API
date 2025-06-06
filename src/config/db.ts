const mongoose = require('mongoose')
import dotenv from 'dotenv'

export default async function connectDB(){
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      /*Optional configurations*/
    })
    console.log('MongoDB Connected')
  } catch (err) {
    console.error('connectDB error: ' + err)
  }
}
