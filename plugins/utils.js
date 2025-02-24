"use strict";

const fp = require("fastify-plugin");
const os = require("os");
const { exec } = require("child_process");

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope
/**
 * @name ipv6地址换成ipv4
 * @param {*} ip
 * @returns
 */
function ipv6ToV4(ip) {
  if (ip.split(",").length > 0) {
    ip = ip.split(",")[0];
  }
  ip = ip.substr(ip.lastIndexOf(":") + 1, ip.length);
  return ip;
}
/**
 * @name 时间格式化
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null;
  }
  const format = cFormat || "{y}-{m}-{d} {h}:{i}:{s}";
  let date;
  if (typeof time === "object") {
    date = time;
  } else {
    if (typeof time === "string" && /^[0-9]+$/.test(time)) {
      time = parseInt(time);
    }
    if (typeof time === "number" && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === "a") {
      return ["日", "一", "二", "三", "四", "五", "六"][value];
    }
    return value.toString().padStart(2, "0");
  });
  return time_str;
}
/**
 * @name 执行cmd指令
 * @param {*} shell
 * @param {*} cwd
 * @param {*} interpreter 解释器
 * @returns
 */
function runShell(shell = "", cwd = "/", interpreter = "") {
  return new Promise((resolve, reject) => {
    if (!shell || shell === "") {
      return resolve();
    }
    const platform = os.platform() === "win32" ? "Windows" : "Linux";
    // '/bin/bash -c "netstat -ntlp | grep 8080"',
    let prefix = platform === "Windows" ? "powershell /c" : "/bin/bash -c";
    // 自定义解释器
    if (interpreter) {
      prefix = interpreter + prefix.substring(prefix.length - 3);
    }
    exec(
      `${prefix} "${shell}"`,
      { cwd, encoding: "utf8" },
      (error, stdout, stderr) => {
        // console.log("error:", error, "stdout:", stdout, "stderr:", stderr);
        if (error && error.code !== 1) {
          // console.error(
          //   `Command failed: ${error.cmd}\nExit code: ${error.code}\nOutput: ${stderr}`
          // );
          reject(
            `Command failed: ${error.cmd}\nExit code: ${error.code}\nOutput: ${stderr}`
          );
        } else {
          resolve(stdout || "");
        }
      }
    );
  });
}
module.exports = fp(async function (fastify, opts) {
  fastify.decorate("utils", {
    parseTime: parseTime,
    ipv6ToV4: ipv6ToV4,
    runShell: runShell,
  });
});
