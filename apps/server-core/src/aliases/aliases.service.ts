import {Injectable} from '@nestjs/common';
import {Mutation, Request, Txn} from 'dgraph-js';
import {
  EntityCreateError,
  EntityExistsError,
  EntityNotFoundError,
  EntitySearchError,
  EntityUpdateError,
  EntityDeleteError,
} from '../shared/errors.definitions';
import {Err, Ok, Result} from '@entailapps/tsrs';
import {Alias} from './entities/alias.entity';
import {NestDgraphService} from '@entailapps/nest-dgraph';
import {CreateAliasDto} from './dtos/create-alias.dto';
import {DateTime} from 'luxon';
import {UpdateAliasDto} from './dtos/update-alias.dto';

@Injectable()
export class AliasesService {
  constructor(private dgraph: NestDgraphService) {}

  async createAlias(alias: CreateAliasDto): Promise<Result<Alias, EntityCreateError<never>>> {
    const txn: Txn = this.dgraph.client.newTxn();
    try {
      // Construct a query to find aliases with the given username.
      const query = `
        query {
          alias as var(func: type(Alias)) @filter(eq(username, "${alias.username}"))
        }
      `;

      // Require that the above query returns no values.
      const mut = new Mutation();
      mut.setCond('@if(eq(len(alias), 0))');

      // Create the actual entry, populating the audit records and the dgraph type.
      const a: Alias = {
        ...alias,
        createdAt: DateTime.now().toUTC(),
        updatedAt: DateTime.now().toUTC(),
        ['dgraph.type']: ['Alias', 'Entry'],
      };
      mut.setSetJson(a);

      const req = new Request();
      req.setQuery(query);
      req.addMutations(mut);

      const createResult = await txn.doRequest(req);
      await txn.commit();

      if (createResult.getMetrics()!.getNumUidsMap()!.get('mutation_cost')! > 0) {
        // Return the uid of the newly created alias.
        const rep = {
          uid: createResult.toObject().uidsMap[0]![1],
          ...a,
        };

        return new Ok(rep);
      } else {
        return new Err(new EntityCreateError(new EntityExistsError()));
      }
    } catch (e) {
      return new Err(new EntityCreateError(e));
    } finally {
      await txn.discard();
    }
  }

  async getAlias(id: string): Promise<Result<Alias, EntitySearchError<never>>> {
    const txn: Txn = this.dgraph.client.newTxn({readOnly: true});
    // TODO: Find way to solve "username looks like uid" problem to avoid account misfetching
    try {
      const q = `
        {
          alias(func: type(Alias)) @filter(eq(username, "${id}"))
          {
            uid
            expand(_all_)
          }
        }
      `;
      const alias: Alias = (await txn.query(q)).getJson().alias[0];
      if (alias && Object.keys(alias).length > 1) {
        return new Ok(alias);
      } else {
        // Since username search failed, look up by uid if it looks like a dgraph uid
        if (!id.match(/^0x[0-9]+$/)) return new Err(new EntitySearchError(new EntityNotFoundError(false)));
        const q = `
        {
          alias(func: uid(${id})) @filter(type(Alias))
          {
            uid
            expand(_all_)
          }
        }
      `;
        const alias: Alias = (await txn.query(q)).getJson().alias[0];
        if (alias && Object.keys(alias).length > 1) {
          return new Ok(alias);
        } else {
          return new Err(new EntitySearchError(new EntityNotFoundError(false)));
        }
      }
    } catch (e) {
      return new Err(new EntitySearchError(e));
    } finally {
      await txn.discard();
    }
  }

  async updateAlias(uid: string, alias: UpdateAliasDto): Promise<Result<Alias, EntityUpdateError<never>>> {
    const txn: Txn = this.dgraph.client.newTxn();
    try {
      const q = `
        query {
          alias as var(func: uid(${uid})) @filter(type(Alias))
        }
      `;
      const strippedAlias: NonNullable<UpdateAliasDto> = alias;
      const up: {set: {uid: string; updatedAt: DateTime} | NonNullable<UpdateAliasDto>} = {
        set: {
          uid: uid,
          ...strippedAlias,
          updatedAt: DateTime.now().toUTC(),
        },
      };
      const mut: Mutation = new Mutation();
      mut.setCond('@if(gt(len(alias), 0))');
      mut.setSetJson(up);
      const req = new Request();
      req.setQuery(q);
      req.addMutations(mut);
      const updateResult = await txn.doRequest(req);
      await txn.commit();
      if (updateResult.getMetrics()!.getNumUidsMap()!.get('mutation_cost')! > 0) {
        return new Ok(mut.getSetJson());
      } else {
        return new Err(new EntityUpdateError(new EntityNotFoundError(false)));
      }
    } catch (e) {
      return new Err(new EntityUpdateError(e));
    } finally {
      await txn.discard();
    }
  }

  async deleteAlias(uid: string): Promise<Result<{}, EntityDeleteError<never>>> {
    const txn: Txn = this.dgraph.client.newTxn();
    try {
      const mut = new Mutation();
      mut.setDelNquads(`<${uid}> * * .`);
      await txn.mutate(mut);
      await txn.commit();
      return new Ok({});
    } catch (e) {
      return new Err(new EntityDeleteError(e));
    } finally {
      await txn.discard();
    }
  }
}
