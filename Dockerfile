FROM node:alpine
MAINTAINER Prajwal Acharya <mail2prajwal12@gmail.com>
EXPOSE 80
COPY consolidated.json db.json
RUN npm install -g json-server
CMD ["json-server", "db.json"]