FROM node:latest

COPY package*.json /usr/
WORKDIR /usr

RUN  apt-get update && apt-get install tesseract-ocr -y && apt-get install tesseract-ocr-ita -y

#COPY tsconfig.json .

RUN npm install
RUN npm install -g typescript 

WORKDIR /usr/app

COPY . .

#Prende build da packaga.json nella sezione script
RUN npm run build
#RUN tsc
#TO DO wait for db

CMD [ "node", "./dist/app.js" ]
