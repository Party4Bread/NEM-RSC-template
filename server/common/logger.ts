import pino from 'pino';

const l = pino({
  name: process.env.APP_ID,
  level: process.env.LOG_LEVEL??'info'
});

l.e = l.error;
l.i = l.info;

export default l;
