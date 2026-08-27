# Containerised portability for client roadshows where local Node is unavailable
# or the client's IT security requires an isolated sandbox.
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host", "--port", "5173"]
