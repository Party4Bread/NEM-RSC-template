import ExamplesService from '../../services/examples.service';
import { Request, Response } from 'express';

export class Controller {
  async all(_: Request, res: Response): Promise<void> {
    const r = await ExamplesService.all();
    res.json(r);
  }

  async byId(req: Request<{id:string}>, res: Response): Promise<void> {
    const id = Number.parseInt(req.params['id'])
    const r = await ExamplesService.byId(id)
    
    if (r) res.json(r);
    else res.status(404).end();
  }

  async create(req: Request, res: Response): Promise<void> {
    const r = await ExamplesService.create(req.body.name)
    res.status(201)
      .location(`/api/v1/examples/${r.id}`)
      .json(r)    
  }
}
export default new Controller();
