FROM node:10.14.2
COPY ./app /app
EXPOSE 3100
WORKDIR /app
RUN rm -rf node_modules && \
	apt-get update -qq && \ 
	apt-get install -y -qq libzmq3-dev && \ 
	npm install --silent

CMD ["node", "/app/subscriber.js"] 