//Import neccesary modules
import { Request, Response, NextFunction } from "express";

//Import factory
import { successFactory } from "../factory/SuccessMessage";
import { errorFactory } from "../factory/FailMessage";
import { SuccesMessage, ErrorMessage, IMessage } from "../factory/Messages";
import { Model, ModelStatic } from "sequelize";

//Import services OCR
import { recognizeTextFromImage } from "../services/ocrService";

const errorMessageFactory: errorFactory = new errorFactory();
const successMessageFactory: successFactory = new successFactory();

 export interface ICustomRequest extends Request{
    messages?: IMessage[];
    imageUpload?: boolean;
}

class generalCheck{

    
    //Method that check if the passed ID as params exists as a record
    checkIDParamsExist<T extends Model>(model:ModelStatic<T>){
        return async (req:Request, res: Response, next: NextFunction) => {
            try{
                //This type of trasformation consent to avoid error when casting type
                const id_params = req.params.id as unknown as number| string;

                const record = await model.findByPk(id_params);

                if(!record){
                    return next(errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `The ${model.name} record for the specified id parameter provided: ${id_params} was not found or does not exist. `))
                }

                //If the record exist, go to the next middleware
                next();
            }catch(err){
                return next(errorMessageFactory.createMessage(ErrorMessage.generalError, `An error occurs while checking ${model.name} existence.`))

            }
       
        };
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
            
            
            req.messages.push(successMessageFactory.createMessage(SuccesMessage.generalSuccess, "Image analysis has been successful."));
            
          
            }catch(error){
                return next(errorMessageFactory.createMessage(ErrorMessage.generalError, "Image analysis failed."));

            }
        }
        req.messages.push(successMessageFactory.createMessage(SuccesMessage.generalSuccess, "Optional image not inserted"));


        next();
    }

}

//Export an instance of generalCheck
export default new generalCheck();