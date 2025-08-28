# Stage 1: Build Angular app
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build Angular app
COPY . .
RUN npm run build -- --configuration production --project my-ngmodule-project

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy Angular build to Nginx
COPY --from=build /app/dist/my-ngmodule-project/browser/ /usr/share/nginx/html/


# Copy custom Nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
