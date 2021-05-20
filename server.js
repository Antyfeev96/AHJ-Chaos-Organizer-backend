const http = require("http");
const path = require('path');
const fs = require('fs');
const Koa = require("koa");
const koaStatic = require('koa-static');
const koaBody = require('koa-body');
const { v4: uuidv4 } = require('uuid');
const Router = require("koa-router");
// const faker = require('faker');
const Formatter = require('./src/js/formatter.js');
const format = Formatter.format;

const public = path.join(__dirname, '/public')

const app = new Koa();

app.use(koaStatic(public));

app.use(koaBody({
  text: true,
  urlencoded: true,
  multipart: true,
  json: true,
}));

const data = {
  message: [],
  link: [],
  image: [],
  video: [],
  audio: [],
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
  if (ctx.request.files) {
    const { file } = ctx.request.files;
    if (file) {
      const type = file.type.split('/')[0];
      const extension = file.type.split('/')[1];
      const link = await new Promise((resolve, reject) => {
      const oldPath = file.path;
      const filename = `${uuidv4()}.${extension}`;
      const newPath = path.join(public, filename);
        
      const callback = (error) => reject(error);
        
      const readStream = fs.createReadStream(oldPath);
      const writeStream = fs.createWriteStream(newPath);
        
      readStream.on('error', callback);
      writeStream.on('error', callback);
        
      readStream.on('close', () => {
        console.log('close');
        fs.unlink(oldPath, callback);
        resolve(filename);
      });
        
      readStream.pipe(writeStream);
    });

    data[type].push({
      link,
      type,
      timestamp: format()
    });
        
    ctx.response.body = JSON.stringify({
      link,
      type,
      timestamp: format(),
    });
    return;
    }
  }

  const { text, type, array, media } = ctx.request.query;

  if (media) {
    ctx.response.body = data[media];
  }

  switch (text) {
    case 'give-message':
      ctx.response.body = JSON.stringify(data.message);
      return;
    case 'give-link':
      ctx.response.body = JSON.stringify(data.link);
      return;
    case 'give-image':
      ctx.response.body = JSON.stringify(data.image);
      return;
    case 'give-video':
      ctx.response.body = JSON.stringify(data.video);
      return;
    case 'give-audio':
      ctx.response.body = JSON.stringify(data.audio);
      return;
    default:
      break;
  }
  
  const obj = {
    text,
    type,
    id: uuidv4(),
    timestamp: format(),
  }
  
  switch (type) {
    case 'link':
      data.link.push(obj);
      obj.length = data.link.length;
      obj.array = 'link';
      ctx.response.body = JSON.stringify(obj);
      break;
    case 'message':
      data.message.push(obj);
      obj.length = data.message.length;
      obj.array = 'message';
      ctx.response.body = JSON.stringify(obj);
      break;
    case 'image':
      data.image.push(obj);
      obj.length = data.image.length;
      obj.array = 'image';
      ctx.response.body = JSON.stringify(obj);
      break;
    case 'video':
      data.video.push(obj);
      obj.length = data.video.length;
      obj.array = 'video';
      ctx.response.body = JSON.stringify(obj);
      break;
    case 'audio':
      data.audio.push(obj);
      obj.length = data.audio.length;
      obj.array = 'audio';
      ctx.response.body = JSON.stringify(obj);
      break;
  }

  switch (array) {
    case 'link':
      ctx.response.body = ['link', data.link.length];
      break;
    case 'message':
      ctx.response.body = ['message', data.message.length];
      break;
    case 'image':
      ctx.response.body = ['image', data.image.length];
      break;
    case 'video':
      ctx.response.body = ['video', data.video.length];
      break;
    case 'audio':
      ctx.response.body = ['audio', data.audio.length];
      break;
    default:
      break;
  }
});

const router = new Router();

app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port);

