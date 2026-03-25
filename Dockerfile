# Use Node.js for both frontend and backend builds
FROM node:20-alpine AS base

# --- Backend Build Stage ---
FROM base AS backend
WORKDIR /app/server
COPY server/package.json ./
RUN npm install
COPY server/ ./
CMD ["node", "index.js"]

# --- Frontend Build Stage ---
FROM base AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Production Serving Stage ---
FROM nginx:alpine AS production
COPY --from=frontend /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
