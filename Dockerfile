# ESTÁGIO 1: Build (Prepara e compila o código)
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build 

# ESTÁGIO 2: Produção (Imagem final leve e segura)
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./

# Instala APENAS as dependências de produção
RUN npm install --omit=dev

# Puxa o código compilado do estágio anterior
COPY --from=builder /app/dist ./dist 

# Copia os arquivos necessários para o Sequelize-cli rodar as migrações em produção
COPY --from=builder /app/.sequelizerc ./
COPY --from=builder /app/src/database ./src/database

# Expõe a porta que o Fastify escuta (vamos alinhar com a 3333 usada pelo ESP32)
EXPOSE 3333

# Comando padrão para iniciar a API se nenhum outro for passado pelo compose
CMD ["node", "dist/main.js"]