const tesseract = require("node-tesseract-ocr")
const path = require("path");


const img = "https://miro.medium.com/v2/resize:fit:828/format:webp/0*pVWZKQthOggVOr0S.jpeg";
const img1 ="https://production-media.paperswithcode.com/thumbnails/task/b4482a02-2e61-4725-a6c2-6cfcf6c7c31f.jpg";//red car IT20BOM
const img2 ="https://cdn.motor1.com/images/mgl/VmyqK/s1/targhe-italiane.jpg"
const img3 = "https://www.ansa.it/webimages/img_620x438/2019/8/26/738fb79600fdf0fca1e046616fdc4b57.jpg"
//const img = path.join(__dirname, "prova1.png");


const config = {
  lang: "eng",  // Lingua del modello di OCR
  oem: 3,      // Utilizza il motore LSTM, che è avanzato e accurato
  psm: 6,      // Presuppone una singola riga di testo (ideale per targhe)
}


tesseract
  .recognize(img3, config)
  .then((text) => {
    console.log("Result:", text)
  })
  .catch((error) => {
    console.log(error.message)
  })
  