import express, { Application } from 'express';
import path from 'path';
import http from 'http';
import os from 'os';
import l from './logger';
import httpLogger from 'pino-http';
// import errorHandler from '../api/middlewares/error.handler';
import * as OpenApiValidator from 'express-openapi-validator';

const app = express();

export default class ExpressServer {
  private routes: (app: Application) => void;
  constructor() {
    const root = path.normalize(__dirname + '/../..');
    
    app.use(express.json({ limit: process.env.REQUEST_LIMIT || '100kb' }));
    app.use(
      express.urlencoded({
        extended: true,
        limit: process.env.REQUEST_LIMIT || '100kb',
      })
    );
    app.use(httpLogger({logger:l}))
    // app.use(morgan('dev'));
    app.use(express.text({ limit: process.env.REQUEST_LIMIT || '100kb' }));
    app.use(express.static(`${root}/public`));

    /* If you sure that you need openapi doc and validation use this */
    // const apiSpec = path.join(__dirname, 'api.yml');
    // const validateResponses = !!(
    //   process.env.OPENAPI_ENABLE_RESPONSE_VALIDATION &&
    //   process.env.OPENAPI_ENABLE_RESPONSE_VALIDATION.toLowerCase() === 'true'
    // );
    // app.use(process.env.OPENAPI_SPEC || '/spec', express.static(apiSpec));
    // app.use(
    //   OpenApiValidator.middleware({
    //     apiSpec,
    //     validateResponses,
    //     ignorePaths: /.*\/spec(\/|$)/,
    //   })
    // );
  }

  router(routes: (app: Application) => void): ExpressServer {
    routes(app);
    // app.use(errorHandler);
    return this;
  }

  listen(port: number): Application {
    const welcome = (p: number) => (): void =>
      l.info(
        `up and running in ${
          process.env.NODE_ENV || 'development'
        } @: ${os.hostname()} on port: ${p}}`
      );

    http.createServer(app).listen(port, welcome(port));

    return app;
  }
}
