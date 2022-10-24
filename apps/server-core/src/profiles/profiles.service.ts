// TODO: Add better documentation
// TODO: Write tests
import {Injectable} from '@nestjs/common';
import {Mutation, Request, Txn, ERR_ABORTED} from 'dgraph-js';
import {Profile} from './entities/profile.entity';
import {CreateProfileDto} from './dtos/create-profile.dto';
import {Err, Ok, Result} from '@entailapps/tsrs';
import {
  EntityExistsError,
  EntityCreateError,
  EntityNotFoundError,
  EntitySearchError,
  EntityUpdateError,
  EntityDeleteError,
} from '../shared/errors.definitions';
import {DateTime} from 'luxon';
import {UpdateProfileDto} from './dtos/update-profile.dto';
import {NestDgraphService} from '@entailapps/nest-dgraph';

/**
 * Calculates whether a person is of age or not
 * @param dob: string
 * @private
 */
function is18(dob: DateTime): boolean {
  // TODO: Debug why this isn't working
  return DateTime.now().toUTC().diff(dob, 'years').years > 18;
}

@Injectable()
export class ProfilesService {
  constructor(private dgraph: NestDgraphService) {}
  async createProfile(profile: CreateProfileDto): Promise<Result<Profile, EntityCreateError<never>>> {
    const txn: Txn = this.dgraph.client.newTxn();
    try {
      // Query to find if account exists and, if so, store it in user
      const query = `
        query {
          user as var(func: type(Profile)) @filter(eq(authId, "${profile.authId}") OR eq(email, "${profile.email}"))
        }`;
      const mut = new Mutation();
      // Set a condition to return true if the size of the user var is 0 (i.e. no user exists)
      mut.setCond('@if(eq(len(user), 0))');
      // Create a skeleton of the profile we want to create
      const p: Profile = {
        ...profile,
        dob: DateTime.fromISO(profile.dob),
        is18: is18(DateTime.fromISO(profile.dob || '9999-12-01T00:00:00', {zone: 'utc'})),
        createdAt: DateTime.now().toUTC(),
        updatedAt: DateTime.now().toUTC(),
        ['dgraph.type']: ['Profile', 'Entry'],
      };
      mut.setSetJson(p);
      // Create the request and add the query and mutation to it, turning it into a conditional upsert
      const req = new Request();
      req.setQuery(query);
      req.addMutations(mut);
      const createResult = await txn.doRequest(req);
      // Commit the transaction
      await txn.commit();
      // Add returned uid to profile object so that we can return it to the user
      const rep = {
        uid: createResult.toObject().uidsMap[0]![1],
        ...p,
      };
      // Check if number of mutations i.e. "mutation_cost" is larger than 0, indicating the mutation actually happened
      // This is required because upserts don't error when the condition fails, so we check manually
      if (createResult.getMetrics()!.getNumUidsMap()!.get('mutation_cost')! > 0) {
        return new Ok(rep);
      } else {
        return new Err(new EntityCreateError(new EntityExistsError()));
      }
    } catch (e) {
      if (e === ERR_ABORTED) {
        // TODO: add code to handle commit conflicts + retries
        return new Err(new EntityCreateError(e));
      } else {
        return new Err(new EntityCreateError(e));
      }
    } finally {
      await txn.discard();
    }
  }
  async getProfileByUid(uid: string): Promise<Result<Profile, EntitySearchError<never>>> {
    const txn: Txn = this.dgraph.client.newTxn({readOnly: true});
    try {
      const q = `
        {
          profile(func: uid(${uid})) @filter(type(Profile))
          {
            uid
            expand(_all_)
          }
        }`;
      const profile: Profile = (await txn.query(q)).getJson().profile[0];
      // Filter out nodes without any content
      // Necessary because requesting a uid by uid always returns a node
      if (Object.keys(profile).length > 1) {
        return new Ok(profile);
      } else {
        return new Err(new EntitySearchError(new EntityNotFoundError(false)));
      }
    } catch (e) {
      if (e === ERR_ABORTED) {
        // TODO: add code to handle commit conflicts + retries
        return new Err(new EntitySearchError(e));
      } else {
        return new Err(new EntitySearchError(e));
      }
    } finally {
      await txn.discard();
    }
  }
  async updateProfile(uid: string, profile: UpdateProfileDto): Promise<Result<Profile, EntityUpdateError<never>>> {
    const txn: Txn = this.dgraph.client.newTxn();
    try {
      const query = `
        query {
          user as var(func: uid(${uid})) @filter(type(Profile))
        }`;
      // Strip empty keys from input
      const strippedProfile: NonNullable<UpdateProfileDto> = profile;
      // Supplement uid from path
      const up: {set: {uid: string; updatedAt: DateTime} | NonNullable<UpdateProfileDto>} = {
        set: {
          uid: uid,
          ...strippedProfile,
          updatedAt: DateTime.now().toUTC(),
        },
      };
      const mut: Mutation = new Mutation();
      // Check if account actually exists -- Prevents us from making a new one
      mut.setCond('@if(gt(len(user), 0))');
      mut.setSetJson(up);
      const req = new Request();
      req.setQuery(query);
      req.addMutations(mut);
      const updateResult = await txn.doRequest(req);
      await txn.commit();
      if (updateResult.getMetrics()!.getNumUidsMap()!.get('mutation_cost')! > 0) {
        return new Ok(mut.getSetJson());
      } else {
        return new Err(new EntityUpdateError(new EntityNotFoundError(false)));
      }
    } catch (e) {
      if (e === ERR_ABORTED) {
        // TODO: add code to handle commit conflicts + retries
        return new Err(new EntityUpdateError(e));
      } else {
        return new Err(new EntityUpdateError(e));
      }
    } finally {
      await txn.discard();
    }
  }
  async deleteProfile(uid: string): Promise<Result<{}, EntityDeleteError<never>>> {
    const txn: Txn = this.dgraph.client.newTxn();
    try {
      // No query, since we check access to the uid at the gateway
      // If it doesn't exist then we just silent-fail
      const mut = new Mutation();
      // Using nquads (rdf triple format) directly here since it's a single liner
      mut.setDelNquads(`<${uid}> * * .`);
      await txn.mutate(mut);
      await txn.commit();
      return new Ok({});
    } catch (e) {
      if (e === ERR_ABORTED) {
        // TODO: add code to handle commit conflicts + retries
        return new Err(new EntityDeleteError(e));
      } else {
        return new Err(new EntityDeleteError(e));
      }
    } finally {
      await txn.discard();
    }
  }
}
