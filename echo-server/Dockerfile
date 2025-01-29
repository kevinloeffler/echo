# Use Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app
#WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
#COPY package.json package-lock.json

# Install dependencies
RUN npm install

# Copy the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev:watch"]
