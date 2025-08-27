# importing node
FROM node:20.13-alpine as build

# setting working directory
WORKDIR /app

# copying package.json and package-lock.json
COPY package*.json /app/

# installing dependencies
RUN npm install --legacy-peer-deps
RUN npm install -g @angular/cli@19
# Copying files from the local directory to the docker working directory
COPY . /app

# default value
ARG configuration=production

# building the app
RUN npm run build -- --output-path=./build --configuration $configuration \
    && rm -rf node_modules

# importing nginx
# FROM nginx:1.21.3-alpine
FROM nginx

# Copy the build artifacts to the NGINX html directory
COPY --from=build /app/build/browser/ /usr/share/nginx/html

# Remove the default NGINX configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy the NGINX configuration file
# COPY nginx.conf /etc/nginx/conf.d
COPY nginx/nginx.conf /etc/nginx/conf.d

# NGINX default port to expose
EXPOSE 80

# Copying the build files from the build image to the nginx image
# COPY --from=build /app/build /usr/share/nginx/html

# Copying the nginx configuration file to the nginx image
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Starting nginx server
CMD ["nginx", "-g", "daemon off;"]
