FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./

COPY . .

RUN npm install

RUN apt-get install python3
RUN apt-get update
RUN yes | apt-get install python3-pip
RUN pip3 install cryptography

EXPOSE 8080

CMD ["npm", "start"]