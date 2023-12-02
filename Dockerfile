# Using an official Node.js runtime as a parent image
FROM node:14

# Set up the working directory in the container
WORKDIR /usr/src/app

# Copying package.json and package-lock.json to the working directory
COPY package*.json ./

# Installing application dependencies
RUN npm install

# Copying the application code to the container
COPY . .

# port the app runs on
EXPOSE 3000

# Command to run the app
CMD ["node", "app.js"]
