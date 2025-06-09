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


//Environment Variables
dotenv.config({path: '.env'})


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


async function testAINews(){
  try {
     const llmCli = new LLMClient(new GeminiLLMAgent());
  await llmCli.generateNewsContent("Hong Kong finance chief says tariff ruling will bring Trump \"to reason\"From CNN’s Jessie Yeung Just hours after a US federal court blocked President Donald Trump from imposing most of his tariffs, Hong Kong’s financial secretary appeared to praise the move.Asked how countries and companies will react to the court ruling, with uncertainty swirling as the Trump administration appeals, Paul Chan said the decision would “at least bring President Trump to reason,” Reuters reported.Although Hong Kong is a semi-autonomous Chinese city long known as an international trade hub, it has been caught in the crossfire of the US-China trade war.")
    
  } catch (error) {
   
    console.log("Error: " +error)
  }
 
}

try{


testAINews()
}catch(error){
  console.error("testAINews() Error: " ,error)
}

//Connect to Mongo
//console.log(process.env.MONGO_URI)



//Test pipeline
const runner = new PipelineRunner(new Sourcer(new rssAppStrategy()),'https://rss.app/feeds/t7zYcTG5LJcM1F0c.xml',['crypto']);

async function test(){
  try{
    await runner.runPipeline()
    }catch(err){
      console.log("Test pipeline error: ",err)
    }
}

test()




module.exports = app