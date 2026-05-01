import {SourcingStrategy} from './SourcingStrategy'
import {Media, SourcerRequest} from '../../types'


//Context class for the Sourcing strategy
export default class Sourcer{
    private sourcingStrategy: SourcingStrategy;

    constructor(sourcingStrategy: SourcingStrategy){
        this.sourcingStrategy = sourcingStrategy;
    }

    public async source(request: SourcerRequest): Promise<Media []|null>{
        try{
            const newMediaArr =  await this.sourcingStrategy.source(request);
            return newMediaArr; 

        }catch(err){
            throw new Error("Error in Sourcer: " + err)
        }
       
    }
}