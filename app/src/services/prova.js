const tesseract = require("node-tesseract-ocr")
const path = require("path");


const img = "https://miro.medium.com/v2/resize:fit:828/format:webp/0*pVWZKQthOggVOr0S.jpeg";
const img1 ="https://production-media.paperswithcode.com/thumbnails/task/b4482a02-2e61-4725-a6c2-6cfcf6c7c31f.jpg";//red car IT20BOM
//const img = path.join(__dirname, "prova1.png");


const config = {
  lang: "eng",  // Lingua del modello di OCR
  oem: 3,      // Utilizza il motore LSTM, che è avanzato e accurato
  psm: 6,      // Presuppone una singola riga di testo (ideale per targhe)
}


tesseract
  .recognize(img1, config)
  .then((text) => {
    console.log("Result:", text)
  })
  .catch((error) => {
    console.log(error.message)
  })
  