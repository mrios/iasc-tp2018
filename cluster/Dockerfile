FROM node:10.14.2
COPY ./app /app
WORKDIR /app
RUN rm -rf node_modules && \ 
	apt-get update -qq && \
	apt-get install -y -qq libzmq3-dev && \ 
	npm install --silent

EXPOSE 3300
CMD ["node", "/app/cluster.js"]