FROM node:latest

WORKDIR /usr
COPY package*.json .
#COPY tsconfig.json .

RUN npm install
RUN npm install typescript -g

WORKDIR /usr/app

COPY . .

#RUN  pwd
#WORKDIR /usr/app/src
# Prende build da packaga.json nella sezione script
#RUN npm run build
RUN tsc

#CMD [ "node", "./src/app.js" ]
