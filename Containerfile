FROM node:18

WORKDIR /app

# copy workspace files
COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages

# install dependencies
RUN npm install

# build (if build script exists)
RUN npm run build || echo "no build step"

# expose app port (adjust if needed)
EXPOSE 3000

# start app (adjust app name if needed)
CMD ["npm", "run", "dev"]

