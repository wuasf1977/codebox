const port = 3000;
const express = require("express");
const app = express();
var exec = require("child_process").exec;
const https = require('https');
const { createProxyMiddleware } = require("http-proxy-middleware");

app.get("/", function (req, res) {
  res.send("https://mirrors.tuna.tsinghua.edu.cn/");
});

// 获取系统监听端口
app.get("/listen", function (req, res) {
  let cmdStr = "ss -nltp";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>error\n" + err + "</pre>");
    } else {
      res.type("html").send("<pre>error\n" + stdout + "</pre>");
    }
  });
});

// keepalive begin
function keep_web_alive() {
  exec("curl -m8 127.0.0.1:" + port, function (err, stdout, stderr) {
    if (err) {
      console.log("keep error:" + err);
    }
    else {
      console.log("keep:" + stdout);
    }
  });
  exec("pgrep -laf nginx", function (err, stdout, stderr) {
    if (stdout.includes("./services/nginx -c ./services/config.json")) {
      console.log("nginx running...");
    } else {
      exec(
        "chmod +x ./services/nginx && ./services/nginx -c ./services/config.json >/dev/null 2>&1 &",
        function (err, stdout, stderr) {
          if (err) {
            console.log("keep error:" + err);
          } else {
            console.log("keep web succes");
          }
        }
      );
    }
  });
}
setInterval(keep_web_alive, 180 * 1000);

app.use(
  "/",
  createProxyMiddleware({
    changeOrigin: true,
    onProxyReq: function onProxyReq(proxyReq, req, res) {},
    pathRewrite: {
      "^/": "/"
    },
    target: "http://127.0.0.1:8080/",
    ws: true
  })
);

exec("bash entrypoint.sh", function (err, stdout, stderr) {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
