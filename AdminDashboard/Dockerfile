FROM node:25

WORKDIR /app

COPY package*.json ./

# Used during build
RUN npm install

# dont forget a docker ignore
# first dot hist source, second is destiantion
COPY . .

RUN npm run build

ENV PORT=5173
EXPOSE 5173
#Used for actualy running (not build process)
CMD ["npm", "start"]