"use strict";

module.exports = async function (fastify, opts) {
  fastify.post("/runShell", async (req, res) => {
    try {
      let data = "";
      if (req.body.shell && req.body.shell !== "") {
        data = await fastify.utils.runShell(
          req.body.shell,
          req.body.cwd,
          req.body.interpreter
        );
      }
      res.send({
        success: true,
        data,
      });
    } catch (error) {
      res.send({
        success: false,
        message: error,
      });
    }
  });
};
