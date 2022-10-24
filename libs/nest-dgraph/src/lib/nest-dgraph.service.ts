import {Inject, Injectable} from '@nestjs/common';
import {DgraphClient, DgraphClientStub} from 'dgraph-js';
import {NestDgraphOptions} from './interfaces/options.interface';

@Injectable()
export class NestDgraphService {
  private _client: DgraphClient | null | undefined;
  private _stubs: DgraphClientStub[] | null | undefined;

  get client(): DgraphClient {
    return <DgraphClient>this._client;
  }

  constructor(@Inject('NestDgraphOptions') options: NestDgraphOptions) {
    this.createClient(options);
  }

  createClient(options: NestDgraphOptions) {
    if (!this._client) {
      this._stubs = options.clientStubs.map(stub => {
        return new DgraphClientStub(stub.address, stub.credentials, stub.options);
      });
      this._client = new DgraphClient(...this._stubs);
      if (options.debug) {
        this._client.setDebugMode(true);
      }
    }
    return this._client;
  }

  destroy(): void {
    if (this._stubs) {
      this._stubs.forEach(stub => {
        stub.close();
      });
      this._stubs = null;
    }
    this._client = null;
  }
}
