FROM node:alpine
MAINTAINER Prajwal Acharya <mail2prajwal12@gmail.com>
EXPOSE 8888
COPY consolidated.json db.json
RUN npm install -g json-server
CMD ["json-server", "--port", "8888", "--read-only", "--watch", "db.json"]