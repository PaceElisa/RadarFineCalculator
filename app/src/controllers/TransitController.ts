//Import neccesary modules
import { Request, Response, NextFunction } from "express";
import Transit from "../models/Transit";
import Vehicle from "../models/Vehicle";
import Limit from "../models/Limit";
import { recognizeTextFromImage } from "../services/ocrService";
import { upload } from "../middleware/uploadMIddleware";

//Define class TransitController class
class TransitController {

  /*
  async processTransitImage(req: Request, res: Response): Promise<any> {
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
*/

  // AGGIORNARE LA FUNZIONE SOTTO POICHE SI USANO I MIDDLEWARE DI VALIDATION
  // dopo che aggiorno un transit con la data di uscita dal segment controllo se c'è stata una violazione dei limiti
  async checkViolation(req: Request, res: Response): Promise<boolean | null> {
    var result: any;
    try {
      // Extract plate from route parameters
      const plate = req.params.plate;
      const { exit_at } = req.body;

      // Ottieni l'ultimo record inserito per la plate
      const lastTransit = await Transit.getLastInsertedRecordByPlate(plate);

      // Verifica se è stato trovato un record
      if (!lastTransit) {
        res.status(404).json({ message: 'No records found for the specified plate.' });
        return null;
      }

      // Extract other attributes from the request body
      const { enter_at, weather_conditions } = lastTransit;

      // Ensure enter_at, exit_at, and weather_conditions are provided
      if (!enter_at || !exit_at || !weather_conditions) {
        res.status(400).json({ error: 'Missing required parameters' });
        return null;
      }

      // Convert enter_at and exit_at to Date objects
      const enterAtDate = new Date(enter_at);
      const exitAtDate = new Date(exit_at);

      // Validate weather_conditions TODO IN UN MIDDLEWARE PRECEDENTE
      const validWeatherConditions = ['good', 'bad'];
      if (!validWeatherConditions.includes(weather_conditions)) {
        res.status(400).json({ error: `Invalid weather condition '${weather_conditions}'` });
        return null;
      }

      // Ottieni la distanza del segmento
      const segmentDistance = await lastTransit.getSegmentDistance();

      if (!segmentDistance) {
        res.status(404).json({ message: 'Segment not found.' });
        return null;
      }

      // Fetch the good weather limits for the vehicle
      const goodWeatherLimits = await Vehicle.getGoodWeatherLimits(plate);
      // Fetch the bad weather limits for the vehicle
      const badWeatherLimits = await Vehicle.getBadWeatherLimits(plate);

      if (goodWeatherLimits === null || badWeatherLimits === null) {
        console.log(`Limits not found for vehicle with plate ${plate}`);
        return null;
      }

      // Calcola la durata del transito in minuti
      const duration = (exitAtDate.getTime() - enterAtDate.getTime()) / (1000 * 60); // Converti millisecondi in minuti
      
      // Calcola la velocità media in km/h
      const averageSpeed = (segmentDistance / duration) * 60; // Converti km/min in km/h

      // Determina il limite applicabile basato sulle condizioni meteorologiche
      const applicableLimit = weather_conditions === 'good' ? goodWeatherLimits : badWeatherLimits;

      if (applicableLimit === undefined) {
        console.log(`Invalid weather condition '${weather_conditions}'`);
        return null;
      }

      // Verifica se la velocità media supera il limite
      if (averageSpeed > applicableLimit) {
        // Crea una violazione
        console.log(`Violation detected for vehicle with plate ${plate}. Average Speed: ${averageSpeed.toFixed(2)} km/h, Limit: ${applicableLimit} km/h.`);
        result = true;
      } else {
        console.log(`No violation for vehicle with plate ${plate}. Average Speed: ${averageSpeed.toFixed(2)} km/h, Limit: ${applicableLimit} km/h.`);
        result = false;
      }
      return result;
    } catch (error) {
      console.error(`Error in checkViolation for plate ${req.params.plate}:`, error);
      result = null;
    }
    return result;
  }
}

export default new TransitController();