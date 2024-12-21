# 1. Specify the Base Image
# Use an official Node.js image. Consider using a slim or alpine version for smaller image size.
FROM node:16-alpine

# 2. Set the Working Directory
# This is where your application code will reside inside the container.
WORKDIR /app

# 3. Copy Package Files
# Copy package.json and package-lock.json first to leverage Docker layer caching.
COPY package*.json ./

# 4. Install Dependencies
# Install project dependencies.
RUN npm install

# 5. Copy Application Code
# Copy the rest of your application code into the container.
COPY . .

# 6. Expose the Port
# Inform Docker that the container listens on port 3000 (or whichever port your app uses).
EXPOSE 3000

# 7. Define the Command to Run Your App
# This is the command that will be executed when the container starts.
CMD ["node", "server.js"]