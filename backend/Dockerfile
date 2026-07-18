# Use the official Node.js active LTS version as base
FROM node:20

# Create application directory
WORKDIR /usr/src/app

# Copy package configuration files
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose backend API port
EXPOSE 3000

# Start command
CMD ["npm", "start"]
