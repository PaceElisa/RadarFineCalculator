/**
 * Create a dedicated service to manage the recognition of license plates in images
 */
import * as tesseract_ocr from 'node-tesseract-ocr';

//set the parameters to pass to Tesseract OCR Engine
const config = {
    lang: "ita",  //Language used in the OCR template.
    oem: 3,      // Automatically uses the most suitable engine (often LSTM, which is advanced and accurate)
    psm: 6,      // Assumes a single uniform block of text
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' // Whitelist of characters
  }

export const recognizeTextFromImage = async(imagePath: string): Promise<string> => {
    try{
        const text = await tesseract_ocr.recognize(imagePath, config);
        return text.trim().slice(1,-1); //remove initial and final spaces and the first and last characters
        //console.log("Result:", text) //for initial testing
    }catch (error){
        console.error("Error recognitzing text:", error);
        throw new Error("OCR recognition failed");
    }
} 
/*//Test
const img1 ="https://production-media.paperswithcode.com/thumbnails/task/b4482a02-2e61-4725-a6c2-6cfcf6c7c31f.jpg";
recognizeTextFromImage(img1);
*/