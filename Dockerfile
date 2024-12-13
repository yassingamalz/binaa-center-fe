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

# Build the Angular app
RUN npm run build --prod

# Step 2: Serve the Angular app using Nginx
FROM nginx:alpine

# Copy the build output to the Nginx container's web directory
COPY --from=build /app/dist/binaa-center-fe /usr/share/nginx/html

# Expose port 3200 for the web server
EXPOSE 3200

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]
