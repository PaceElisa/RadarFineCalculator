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

const messageFactory: MessageFactory = new MessageFactory();

 export interface ICustomRequest extends Request{
    messages?: IMessage[];
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
        //Create an Info message if not already presente in the requeste    
        if (!req.messages) {
            req.messages = [];
        }

        if (req.file) {
            try {
            const imagePath = req.file.path;
            //Update the path image in the body 
            req.body.img_route = imagePath;
            const recognizedText = await recognizeTextFromImage(imagePath);
            
            //Update the license plate in the body
            req.body.plate = recognizedText;
            req.imageUpload = true;
            
            
            req.messages.push(messageFactory.createMessage(HttpStatus.OK, "Analisi dell'immagine è andata a buon fine."));
            
          
            }catch(error){
                next(messageFactory.createMessage(HttpStatus.INTERNAL_SERVER_ERROR, "Qualcosa è andato storto. Analisi dell'immagine non è andata a buon fine."));

            }
        }
        req.messages.push(messageFactory.createMessage(HttpStatus.OK, "Immagine opzionale non inserita"));


        next();
    }

}

//Export an instance of generelCheck
export default new generalCheck();