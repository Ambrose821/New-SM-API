import {RssSourcingStrategy} from './SourcingStrategy'
import {Media} from '../../types'


//Context class for the Sourcing strategy
export default class Sourcer{
    private sourcingStrategy: RssSourcingStrategy;

    constructor(sourcingStrategy: RssSourcingStrategy){
        this.sourcingStrategy = sourcingStrategy;
    }

    public async source(url: string): Promise<Media|null>{
        try{
            const newMedia =  await this.sourcingStrategy.sourceFeed(url);
            return newMedia; 

        }catch(err){
            throw new Error("Error in Sourcer: " + err)
        }
       
    }
}