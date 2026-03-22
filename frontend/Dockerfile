# Use Node for building
FROM node:18-slim AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Use Nginx for serving in production
FROM nginx:alpine

# Copy build files to Nginx public folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Default Nginx command
CMD ["nginx", "-g", "daemon off;"]
