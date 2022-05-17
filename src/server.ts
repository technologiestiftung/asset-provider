import "make-promises-safe";
import fastify, { FastifyRequest, FastifyReply } from "fastify";
import auth from "@fastify/auth";
import helmet from "@fastify/helmet";
import basicAuth from "@fastify/basic-auth";
import fastifySensible from "@fastify/sensible";

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

// import fs from "node:fs";
if (!process.env.AWS_ACCESS_KEY_ID) {
  throw new Error("AWS_ACCESS_KEY_ID is not set");
}

if (!process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error("AWS_SECRET_ACCESS_KEY is not set");
}
if (!process.env.USERNAME || !process.env.PASSWORD) {
  throw new Error("USERNAME and PASSWORD are not set");
}
if (!process.env.AWS_S3_BUCKET) {
  throw new Error("AWS_S3_BUCKET is not set");
}
export const server = fastify({
  logger: true,
});
function validate(
  username: string,
  password: string,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  _req: FastifyRequest,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  _reply: FastifyReply,
  done: (arg0: Error | undefined) => void,
) {
  if (username === process.env.USERNAME && password === process.env.PASSWORD) {
    done(undefined);
  } else {
    done(new Error("Winter is coming"));
  }
}
const client = new S3Client({});
const authenticate = { realm: "technologiesitftung" };

server.register(helmet);
server.register(auth);
server.register(basicAuth, { validate, authenticate });
server.register(fastifySensible);

server.after(() => {
  server.route({
    method: "GET",
    url: "/",
    handler: async (_request, reply) => {
      reply.type("text/plain").send(`Routes:
      GET / This document

      GET /:key the file you are requesting
      Example: curl  --fail http://USERNAME:PASSWORD@localhost:8080 --output out.zip
      `);
    },
  });
  server.route<{
    Params: { key: string };
  }>({
    method: "GET",
    url: "/:key",
    onRequest: server.auth([server.basicAuth]),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    handler: async (request, reply) => {
      const { key } = request.params;
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
      });
      let response;
      try {
        response = await client.send(command);
      } catch (error) {
        console.error(error);
        throw server.httpErrors.notFound();
      }

      // let type = "text/plain";
      // if (file.ContentType) {
      //   type = file.ContentType;
      // }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      reply.type(response.ContentType!).send(response.Body);
    },
  });
});
