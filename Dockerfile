FROM node:alpine
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 6000
CMD ["node","./dist/src/index.js"]