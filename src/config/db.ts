const mongoose = require('mongodb')

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
