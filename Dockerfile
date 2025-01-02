# Base image is node 20
FROM node:20-alpine
# Defining work directory
WORKDIR /usr/app/src
# Exposing the port
EXPOSE 3001
# Copying the project files
COPY . .
# Installing the packages
RUN npm install
# Starting the service
CMD [ "npm", "start" ]