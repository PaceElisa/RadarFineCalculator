/**
 * Create a dedicated service to manage the recognition of license plates in images
 */
import * as tesseract_ocr from 'node-tesseract-ocr';

//set the parameters to pass to Tesseract OCR Engine
const config = {
    lang: "ita",  //Language used in the OCR template.
    oem: 3,      // Automatically uses the most suitable engine (often LSTM, which is advanced and accurate)
    psm: 6,      // Assumes a single uniform block of text
    tessedit_char_whitelist: 'ABCDEFGHIJKLMOPQRSTVWXYZ0123456789' // Whitelist of characters
  }

export const recognizeTextFromImage = async(imagePath: string): Promise<string> => {
    try{
        const text = await tesseract_ocr.recognize(imagePath, config);
         console.log("Result:", text) 
        return text.trim()//remove initial and final spaces
       
    }catch (error){
        console.error("Error recognitzing text:", error);
        throw new Error("OCR recognition failed");
    }
} 
