FROM node:17-alpine
RUN npm config set registry https://registry.npm.taobao.org/
RUN npm install -g lerna 
WORKDIR /app
COPY package.json .
COPY lerna.json  .
COPY . .
RUN lerna bootstrap
RUN npm rebuild esbuild 
EXPOSE 3000
CMD ["yarn", "dev"]