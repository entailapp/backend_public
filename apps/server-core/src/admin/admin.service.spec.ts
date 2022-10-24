import {Test} from '@nestjs/testing';

import {AdminService} from './admin.service';
import {NestDgraphModule, NestDgraphModuleOptions} from '@entailapps/nest-dgraph';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {ChannelCredentials} from '@grpc/grpc-js';
import Joi from 'joi';

describe('AdminService', () => {
  let service: AdminService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          validationSchema: Joi.object({
            SENTRY_ENABLED: Joi.boolean().default(false),
            SENTRY_DEBUG: Joi.boolean().default(false),
            SENTRY_DSN: Joi.string().pattern(new RegExp('^https://[a-z0-9]+@sentry.entail.app/[0-9]+$')),
            SENTRY_SERVER_NAME: Joi.string(),
            SENTRY_LOGLEVEL: Joi.string().valid('None', 'Error', 'Debug', 'Verbose').default('Error'),
            DGRAPH_ADDRS: Joi.string()
              .regex(new RegExp('[a-zA-Z0-9:/?=]+(;[a-zA-Z0-9:/?=]+)?'))
              .default('localhost:9080'),
            DGRAPH_DEBUG: Joi.boolean().default(false),
            NODE_ENV: Joi.string().default('development'),
            RELEASE: Joi.string().allow('').default('dev'), // TODO: Check for https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
          }),
          envFilePath: 'apps/server-core/.env',
          isGlobal: true,
        }),
        NestDgraphModule.forRoot({
          NestDgraphOptionsFactory: {
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
              return {
                clientStubs: config
                  .get<string>('DGRAPH_ADDRS')!
                  .split(';')
                  .map(
                    (
                      address: string
                    ): {
                      address: string;
                      credentials: ChannelCredentials;
                    } => {
                      return {
                        address,
                        credentials: ChannelCredentials.createInsecure(),
                      };
                    }
                  ),
                debug: config.get<boolean>('DGRAPH_DEBUG'),
              };
            },
          },
        } as NestDgraphModuleOptions),
      ],
      providers: [AdminService],
    }).compile();

    service = app.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
