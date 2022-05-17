FROM --platform=linux/amd64 node:18-slim as builder
ENV NODE_ENV=development
WORKDIR /usr/src/app

COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm ci
COPY . .
RUN npm run build

FROM --platform=linux/amd64 node:18-slim as runner
ENV NODE_ENV=production
WORKDIR /usr/app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm ci --silent
COPY --from=builder /usr/src/app/dist /usr/app/

EXPOSE 8080
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
RUN chown -R node /usr/app
USER node
ENTRYPOINT ["/tini", "--"]
CMD ["node", "/usr/app/index.js"]
