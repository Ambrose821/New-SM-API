import express from 'express'
import dotenv from 'dotenv'
import createError from 'http-errors'
import logger from 'morgan'
//import cookieParser from 'cookie-parser'
import session from 'express-session'
import path from 'path'


//My Stuff
import { nineStrategy ,rssAppStrategy} from './services/Sourcing/SourcingStrategy'
import connectDB from './config/db'
import PipelineRunner from './pipeline/pipelineRunner'
import Sourcer from './services/Sourcing/Sourcer'
import pLimit from 'p-limit'

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



connectDB()
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



//Play area

import { LLMAgent,GeminiLLMAgent } from './services/AIServices/LLMAgent'
import { LLMClient } from './services/AIServices/LLMClient'





//Connect to Mongo
//console.log(process.env.MONGO_URI)



//Test pipeline 
const runner = new PipelineRunner(new Sourcer(new rssAppStrategy()),'https://rss.app/feeds/tmOEuxn2W4E8x9fv.xml',['politics']);



async function test(){
  try{
    // const string = await OpenverseTokenHandler.getInstance().getCurrentAccessToken();
    // console.log(string)
    await runner.runPipeline()
    // const cli = new OpenverseClient();
    // const imageData = await cli.getImagesFromKeyWords(1, ['trump','russia'])
    }catch(err){
      console.log("Test pipeline error: ",err)
    }
}

test()




module.exports = app