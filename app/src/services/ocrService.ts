import * as tesseract_ocr from 'node-tesseract-ocr';

const config = {
    lang: "eng",
    oem: 3,
    psm: 3,
}

export const recognizeTextFromImage = async(imagePath: string) => {
    try{
        const text = await tesseract_ocr.recognize(imagePath, config)
        console.log("Result:", text)
    }catch (error){
        console.error("Error recognitzing text:", error);
        throw new Error("OCR recognition failed");
    }
} 
recognizeTextFromImage("prova1.png");