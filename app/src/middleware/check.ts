//Import neccesary modules
import { Request, Response, NextFunction } from "express";


//Import Models
import Vehicle from "../models/Vehicle";
import Limit from "../models/Limit";
import Segment from "../models/Segment";
import Transit from "../models/Transit";
import User from "../models/User";
import Violation from "../models/Violation";

//Import factory
import { MessageFactory, IMessage, HttpStatus  } from "../factory/Messages";
import { Model, ModelStatic } from "sequelize";

//Import services OCR
import { recognizeTextFromImage } from "../services/ocrService";

const MessageFact: MessageFactory = new MessageFactory();

 export interface ICustomRequest extends Request{
    message?: IMessage[];
    imageUpload?: boolean;
}

class generalCheck{

    //Method that check if the passed ID exists
    checkIDExist<T extends Model>(model:ModelStatic<T>){
        return async (req:Request, res: Response, next: NextFunction) => {
            try{
                next();
            }catch{

            }

        
        };
    }

    //Method that checks if the passed plate exists
    checkPlateExist(req:Request, res: Response, next:NextFunction){
       
        

        next();
    }

    //Check if an image is provided and try to identify the text (plate) present
     async checkImage(req:ICustomRequest, res: Response, next:NextFunction){
        req.imageUpload = false; // flag to pass in the middleware for checking if an image is provied
        
        if (req.file) {
            try {
            const imagePath = req.file.path;
            req.body.img_route = imagePath;
            const recognizedText = await recognizeTextFromImage(imagePath);

            req.body.pl
            
          
            }catch{}
        }

        next();
    }

}

//Export an instance of generelCheck
export default new generalCheck();