# Step 1: Build the Angular project
FROM node:18 AS build

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./ 

# Install dependencies
RUN npm install

# Copy the Angular app source code
COPY . . 

# Build with production configuration
RUN npm run build:production

# Step 2: Serve the Angular app using Nginx
FROM nginx:alpine

# Copy the custom nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Copy the build output to the Nginx container's web directory
COPY --from=build /app/dist/binaa-center-fe /usr/share/nginx/html

EXPOSE 3200

CMD ["nginx", "-g", "daemon off;"]