# ESTÁGIO 1: Build (Prepara e compila o código)
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Compila o TypeScript (Garante que você tenha o script "build" no package.json)
RUN npm run build 

# ESTÁGIO 2: Produção (Imagem final leve e segura)
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
# Instala APENAS as dependências de produção (ignora nodemon, types, etc)
RUN npm install --omit=dev
# Puxa o código compilado do estágio anterior
COPY --from=builder /app/dist ./dist 

EXPOSE 3000