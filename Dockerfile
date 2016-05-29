
FROM node:5

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install; npm install -g sails
COPY . /usr/src/app

CMD ["sails", "lift"]

