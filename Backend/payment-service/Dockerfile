FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/

RUN mkdir -p logs && chown -R node:node /app

EXPOSE 3002

USER node

CMD ["npm", "start"]