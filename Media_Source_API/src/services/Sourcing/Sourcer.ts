import {RssSourcingStrategy} from './SourcingStrategy'
import {Media,Genre} from '../../types'


//Context class for the Sourcing strategy
export default class Sourcer{
    private sourcingStrategy: RssSourcingStrategy;

    constructor(sourcingStrategy: RssSourcingStrategy){
        this.sourcingStrategy = sourcingStrategy;
    }

    public async source(url: string,genres: Genre[]): Promise<Media []|null>{
        try{
            const newMediaArr =  await this.sourcingStrategy.sourceFeed(url,genres);
            return newMediaArr; 

        }catch(err){
            throw new Error("Error in Sourcer: " + err)
        }
       
    }
}