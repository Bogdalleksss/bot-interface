FROM node:21.5.0
RUN npm install -g npm
WORKDIR /app
COPY package.json ./
RUN npm i
COPY . .

CMD [ "vue-cli-service", "serve" ]
CMD [ "vue-cli-service", "express:run" ]
