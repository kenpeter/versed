FROM node:stretch

RUN apt-get update
RUN apt-get install libreoffice -y
RUN apt-get install ffmpeg -y
RUN apt-get install vim -y

WORKDIR /root
COPY .vimrc .

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "node", "index.js" ]
