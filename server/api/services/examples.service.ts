import L from '../../common/logger';

let id = 0;
interface Example {
  id: number;
  name: string;
}

const examples: Example[] = [
  { id: id++, name: 'example 0' },
  { id: id++, name: 'example 1' },
];

export class ExamplesService {
  async all(): Promise<Example[]> {
    L.info(examples, 'fetch all examples');
    // This could be DB Operation
    return examples;
  }

  async byId(id: number): Promise<Example> {
    L.info(`fetch example with id ${id}`);
    return (await this.all())[id];
  }

  async create(name: string): Promise<Example> {
    L.info(`create example with name ${name}`);
    const example: Example = {
      id: id++,
      name,
    };
    examples.push(example);
    return example;
  }
}

export default new ExamplesService();
