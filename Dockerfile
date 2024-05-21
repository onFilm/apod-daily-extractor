FROM node:alpine
MAINTAINER Prajwal Acharya <mail2prajwal12@gmail.com>
EXPOSE 8888
COPY consolidated.json db.json
RUN npm install -g json-server@0.17.4
CMD ["json-server", "--read-only", "--watch", "db.json"]