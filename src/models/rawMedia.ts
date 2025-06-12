import { Schema, model } from "mongoose";
import {Media} from "../types";




//DONT USE THIS MODEL
const rawMediSchema = new Schema<Media>({
    headline:{
        type: String,
        required:true,
        unique:true //DRY. This is unlikely but lets save space
    },
    textSnippet:{
        type:String,
        required:false,
    },
    sourceURL:{
        type:String,
        required:true,
    },
    imageURL:{
        type:String,
        default:null
    },
    videoURL:{
        type:String,
        default:null,
    },
    genre:{
        type:[String],
        default:[],
        enum:['news','politics','sports','memes','humour','finance','crypto']
    },
    sourcedAt:{
        type:Date,
        default: Date.now
    },
    sourceName:{
        type:String,
        default:null,
    },
    creditTo:{
        type:String,
        default:'unknown'

    }

})


export default model<Media>('RawMedia',rawMediSchema)