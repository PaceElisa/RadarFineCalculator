FROM node:latest

WORKDIR /usr
COPY package*.json .

RUN npm install
RUN npm install typescript -g

COPY . .

RUN tsc

CMD ["node", "./dist/app.js"]