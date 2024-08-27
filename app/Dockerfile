FROM node:latest

WORKDIR /usr
COPY package*.json .
#COPY tsconfig.json .

RUN npm install
RUN npm install typescript -g

#WORKDIR /usr/app

COPY . .

#Prende build da packaga.json nella sezione script
RUN npm run build
#RUN tsc

CMD [ "node", "./dist/app.js" ]
