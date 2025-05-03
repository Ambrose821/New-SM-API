import express from 'express'
import dotenv from 'dotenv'
import createError from 'http-errors'
import logger from 'morgan'
//import cookieParser from 'cookie-parser'
import session from 'express-session'
import path from 'path'



import { nineStrategy } from './services/Sourcing/SourcingStrategy'

//Testing stuff 
const strat = new nineStrategy()

strat.sourceFeed('https://9gagrss.com/feed/')




//import pLimit from 'p-limit'
//Environment Variables
dotenv.config({path: '.env'})
//App
const app = express();
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(logger('dev'))
app.use(express.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname,'../public')));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    //store: MongoStore.create({mongoUrl: process.env.MONGO_URI})
  }));


  //forward 404 to error handler
app.use(function(req,res,next){
    next(createError(404))
})

// error handler
app.use(function(err:any, req:any, res:any, next:any) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });


app.listen(PORT, () =>{
    console.log(`Server Running on ${PORT}`)
})

module.exports = app