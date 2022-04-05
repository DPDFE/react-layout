FROM node:17-alpine
RUN npm config set registry https://registry.npm.taobao.org/
RUN npm install -g lerna 
WORKDIR /app
COPY package.json /app/package.json
COPY lerna.json  /app/lerna.json
COPY . /app
RUN lerna bootstrap
CMD ["yarn", "dev"]