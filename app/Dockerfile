FROM node:latest

COPY package*.json /usr/
WORKDIR /usr

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
