import './common/env';
import Server from './common/server';
import routes from './routes';
import Database from './database';

Database.init();

const port = parseInt(process.env.PORT ?? '3000');
export default new Server()
  .router(routes)
  .listen(port);