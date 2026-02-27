FROM node:24.14.0-alpine3.23

RUN apk add --no-cache curl nano

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci

COPY tsconfig.json ./
COPY es.ts ./
COPY index.ts ./

CMD ["node", "--disable-warning=ExperimentalWarning", "index.ts"]
