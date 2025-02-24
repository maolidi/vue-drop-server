"use strict";

module.exports = async function (fastify, opts) {
  fastify.post("/login", async function (request, reply) {
    const { username, password } = request.body;
    if (username === "admin" && password === "1qaz@WSX") {
      const token = await fastify.jwt.sign({
        username,
      });
      reply.send({
        success: true,
        data: token,
      });
    } else {
      reply.send({
        success: false,
        message: "用户名或密码错误",
      });
    }
  });
};
