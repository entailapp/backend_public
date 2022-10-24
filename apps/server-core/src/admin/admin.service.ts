import {Injectable} from '@nestjs/common';
import {NestDgraphService} from '@entailapps/nest-dgraph';
import {Operation} from 'dgraph-js';
import {open} from 'fs/promises';
import path from 'path';

@Injectable()
export class AdminService {
  constructor(private dgraph: NestDgraphService) {}
  getData(): {message: string} {
    return {message: 'Welcome to server-core!'};
  }
  async resetDB() {
    const op = new Operation();
    op.setDropAll(true);
    await this.dgraph.client.alter(op);
  }
  async setSchema() {
    const file = await open(
      path.join(__dirname, '../schema.rdf'), // TODO: replace with envvar later
      'r'
    );
    const schema = (await file.readFile()).toString(); // TODO: make this safer
    await file.close();
    const op = new Operation();
    op.setSchema(schema);
    await this.dgraph.client.alter(op);
  }
}
