"use strict";

const path = require("node:path");
const AutoLoad = require("@fastify/autoload");

// Pass --options via CLI arguments in command to enable these options.
const options = {};

module.exports = async function (fastify, opts) {
  // Place here your custom code!
  fastify.register(require("@fastify/cors"), {
    origin: true, // allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"], // allow all methods
    allowedHeaders: ["Content-Type", "Authorization"], // allow specific headers
    exposedHeaders: ["Content-Range", "X-Content-Range"], // expose specific headers
    credentials: true, // allow credentials
  });
  fastify.register(require("@fastify/jwt"), {
    secret: "mld456++",
    sign: {
      expiresIn: "24h",
    },
  });
  fastify.register(require("@fastify/multipart"), {
    attachFieldsToBody: true,
    limits: {
      // fieldNameSize: 100, // Max field name size in bytes
      // fieldSize: 100, // Max field value size in bytes
      // fields: 10, // Max number of non-file fields
      fileSize: 5 * 1024 * 1024 * 1024, // For multipart forms, the max file size in bytes
      // files: 1, // Max number of file fields
      // headerPairs: 2000, // Max number of header key=>value pairs
      // parts: 1000, // For multipart forms, the max number of parts (fields + files)
    },
  });
  fastify.addHook("onRequest", async (request, reply) => {
    const urlObject = new URL(`http://127.0.0.1${request.url}`);
    let passAuth = ["/users/login"]
      .map((item) => (urlObject.pathname.startsWith(item) ? 1 : 0))
      .reduce((a, b) => a + b);
    if (!passAuth) {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.send(err);
      }
    }
  });
  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: Object.assign({}, opts),
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    options: Object.assign({}, opts),
  });
};

module.exports.options = options;
