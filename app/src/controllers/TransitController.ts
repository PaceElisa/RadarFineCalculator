//Import neccesary modules
import { Request, Response, NextFunction } from "express";
import Transit from "../models/Transit";
import { recognizeTextFromImage } from "../services/ocrService";
import { upload } from "../middleware/uploadMIddleware";

//Define class TransitController class
class TransitController {

    async processTransitImage(req: Request, res: Response):Promise<any> {
        const plateRegex = /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/;
        try {
          const imagePath = req.file?.path;
          if (!imagePath) {
            return res.status(400).json({ message: "No image uploaded" });
          }
      
          const recognizedText = await recognizeTextFromImage(imagePath);
      
          // Esegui ulteriori operazioni, come la validazione della targa, la registrazione del transito ecc.
          const licensePlate = plateRegex.test(recognizedText); // espressione regolare per validare la targa
      
          if (licensePlate) {
            // Logica per salvare il transito
            res.status(200).json({ message: "Transit processed", licensePlate });
          } else {
            // Se non viene riconosciuta una targa valida
            res.status(422).json({ message: "Unable to recognize a valid license plate" });
          }

      
        } catch (error) {
          res.status(500).json({ message: "Error processing transit", error });
        }
      };


}