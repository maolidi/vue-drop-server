"use strict";
const fs = require("fs");
const path = require("path");
module.exports = async function (fastify, opts) {
  //上传文件
  fastify.post("/uploadFile", async function (request, reply) {
    if (!request.body.path || !request.body.files) {
      return reply.send({
        success: false,
        message: "参数错误",
      });
    }
    const dir = request.body.path.value;
    const files = Array.isArray(request.body.files)
      ? request.body.files
      : [request.body.files];
    for (const data of files) {
      const newFilePath = path.join(dir, data.filename);
      const binaryData = await data.toBuffer();
      fs.writeFileSync(newFilePath, binaryData);
    }
    reply.send({
      success: true,
    });
  });
};
