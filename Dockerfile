FROM node:10.15.3

RUN mkdir /boxscore-api

ADD . /boxscore-api

WORKDIR /boxscore-api

RUN npm install

EXPOSE 8081
CMD ["npm", "start"]