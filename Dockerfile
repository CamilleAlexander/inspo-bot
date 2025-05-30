# Use the official Node.js 20 image from Docker Hub
FROM node:20-slim

# Create and change to the application directory
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this first allows them to be cached separately from the rest of the application code.
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy the rest of the application code
COPY . .

# Run the web service on the container's port 8080
ENV PORT 8080
EXPOSE 8080

# Run the bot
CMD [ "npm", "start" ]
