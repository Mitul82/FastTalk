FROM node:24.11.0 

WORKDIR /app

COPY ./package.json package-lock.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]