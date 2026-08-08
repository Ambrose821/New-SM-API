import express from 'express'
import dotenv from 'dotenv'
import createError from 'http-errors'
import logger from 'morgan'
//import cookieParser from 'cookie-parser'
import session from 'express-session'
import path from 'path'
import cors from 'cors'


//My Stuff
import connectDB from './config/db'
import {connectAgenda} from './config/agenda-config'
import PipelineRunner from './pipeline/pipelineRunner'
import pLimit from 'p-limit'
import type { Pipeline } from './types'

//Openverse token Handling


//Environment Variables
dotenv.config({path: '.env'})


import { OpenverseTokenHandler } from './services/ImageAndVideoSource/openVerseAuth'

//May be overkill but guaruntees we have a token scheduled and in the instance
async function openverseSetup(){
  const tokenHandler = OpenverseTokenHandler.getInstance();
  const token = await tokenHandler.requestAndSetToken();
  tokenHandler.scheduleTokenRefresh();
}
openverseSetup()


//DB and Jobs
connectDB()
connectAgenda()

//App
const app = express();
const PORT = process.env.PORT || 3000

//cors 
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
}
app.use(cors(corsOptions));
app.use(express.json())
app.use(logger('dev'))
app.use(express.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname,'../public')));


// Router imports
import postRoutes from './routes/posts'
import socialAccountsRouter from './routes/socialAccounts'
import pipelineRoutes from './routes/pipelines'


//Use Routes
app.use('/posts',postRoutes)
app.use('/socials',socialAccountsRouter)
app.use('/pipelines',pipelineRoutes)

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
