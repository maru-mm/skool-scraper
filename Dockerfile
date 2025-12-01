# Dockerfile ottimizzato per fly.io
FROM node:18-alpine AS builder

WORKDIR /app

# Copia package files
COPY package.json ./

# Installa tutte le dipendenze (incluse devDependencies per il build)
RUN npm install

# Copia il codice sorgente
COPY . .

# Build del frontend
RUN npm run build

# Stage di produzione
FROM node:18-alpine

WORKDIR /app

# Copia package.json
COPY package.json ./

# Installa solo dipendenze di produzione
RUN npm install --omit=dev

# Copia il backend e il build del frontend
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

# Crea cartella per i dati
RUN mkdir -p /app/data

# Esponi la porta
EXPOSE 8080

# Avvia l'applicazione
CMD ["node", "server/index.js"]
