import {HttpException, Module} from '@nestjs/common';

import {AppController} from './app.controller';
import {AppService} from './app.service';
import {RavenInterceptor, RavenModule} from 'nest-raven';
import {APP_INTERCEPTOR} from '@nestjs/core';
import {ConfigModule, ConfigService} from '@nestjs/config';
import Joi from 'joi';
import {NestDgraphModule, NestDgraphModuleOptions} from '@entailapps/nest-dgraph';
import {ChannelCredentials} from '@grpc/grpc-js';
import {EntityExistsError} from './shared/errors.definitions';
import {AdminModule} from './admin/admin.module';
import {ProfilesModule} from './profiles/profiles.module';
import {AliasesModule} from './aliases/aliases.module';

@Module({
  imports: [
    AdminModule,
    ProfilesModule,
    AliasesModule,
    RavenModule,
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        SENTRY_ENABLED: Joi.boolean().default(false),
        SENTRY_DEBUG: Joi.boolean().default(false),
        SENTRY_DSN: Joi.string().pattern(new RegExp('^https://[a-z0-9]+@sentry.entail.app/[0-9]+$')),
        SENTRY_SERVER_NAME: Joi.string(),
        SENTRY_LOGLEVEL: Joi.string().valid('None', 'Error', 'Debug', 'Verbose').default('Error'),
        DGRAPH_ADDRS: Joi.string().regex(new RegExp('[a-zA-Z0-9:/?=]+(;[a-zA-Z0-9:/?=]+)?')).default('localhost:9080'),
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
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useValue: new RavenInterceptor({
        // N.B. This is a global interceptor.
        //  IT DOES NOT TRIGGER ON WEBSOCKETS OR GRAPHQL
        filters: [
          // Filter exceptions of type HttpException. Ignore those that
          //  have status code of less than 500
          {
            type: HttpException,
            filter: (exception: HttpException) =>
              500 > exception.getStatus() && !(exception instanceof EntityExistsError),
          },
        ],
      }),
    },
  ],
})
export class AppModule {}
