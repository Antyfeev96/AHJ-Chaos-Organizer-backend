const http = require("http");
const Koa = require("koa");
const { v4: uuidv4 } = require('uuid');
const Router = require("koa-router");
const faker = require('faker');
const Formatter = require('./src/js/formatter.js');
const format = Formatter.format;

const app = new Koa();

const data = {
  messages: [],
  links: []
}

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

app.use(async (ctx) => {
  const { message } = ctx.request.query;
  console.log(ctx.request.query);
  const type = message.startsWith('http') || message.startsWith('https') ? 'link' : 'text'
  const obj = {
    message,
    type,
    id: uuidv4(),
    timestamp: format(),
  }

  switch (type) {
    case 'link':
      data.links.push(obj);
      ctx.response.body = JSON.stringify(obj);
      break;
    case 'text':
      data.messages.push(obj)
      ctx.response.body = JSON.stringify(obj);
      break;
  }
});

const router = new Router();

app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port);

