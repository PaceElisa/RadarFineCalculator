import * as tesseract_ocr from 'node-tesseract-ocr';

//setta i parametri da passare
const config = {
    lang: "eng",  // Lingua del modello di OCR
    oem: 3,      // Utilizza automaticamente il motore più adatto (spesso LSTM, che è avanzato e accurato)
    psm: 6,      // Assume un singolo blocco uniforme di testo
  }

export const recognizeTextFromImage = async(imagePath: string): Promise<string> => {
    try{
        const text = await tesseract_ocr.recognize(imagePath, config);
        return text.trim();
        //console.log("Result:", text) //for initial testing
    }catch (error){
        console.error("Error recognitzing text:", error);
        throw new Error("OCR recognition failed");
    }
} 
/*//Prova
const img1 ="https://production-media.paperswithcode.com/thumbnails/task/b4482a02-2e61-4725-a6c2-6cfcf6c7c31f.jpg";
recognizeTextFromImage(img1);
*/