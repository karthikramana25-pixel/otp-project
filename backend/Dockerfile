FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV JWT_SECRET=mysecret
EXPOSE 4000
CMD ["node","index.js"]
