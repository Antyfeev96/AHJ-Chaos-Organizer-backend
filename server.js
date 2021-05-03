const http = require("http");
const Koa = require("koa");
const { v4: uuidv4 } = require('uuid');
const Router = require("koa-router");
const WS = require('ws');

const app = new Koa();

const clients = new Set();

const messages = [
  'Hello!',
  'Hello there!',
  'Привет!'
];

console.log(123);

app.use(async (ctx, next) => {
  const origin = ctx.request.get("Origin");
  if (!origin) {
    return await next();
  }

  const headers = { "Access-Control-Allow-Origin": "*" };

  if (ctx.request.method !== "OPTIONS") {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get("Access-Control-Request-Method")) {
    ctx.response.set({
      ...headers,
      "Access-Control-Allow-Methods": "GET, POST, PUD, DELETE, PATCH",
    });
  }

  if (ctx.request.get("Access-Control-Request-Headers")) {
    ctx.response.set(
      "Access-Control-Allow-Headers",
      ctx.request.get("Access-Control-Request-Headers")
    );
  }

  ctx.response.status = 204;

  ctx.respond = false;
});

const router = new Router();

app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port);
const wsServer = new WS.Server({server});

wsServer.on('connection', (ws, req) => {
  const errCallback = (err) => {
    if (err) {
      console.log(err);
    }
  }

  ws.on('open', msg => {
    console.log(messages);
  })

  ws.on('message', msg => {
    console.log(`message is ${msg}`);
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(clients.size);
  })
});

