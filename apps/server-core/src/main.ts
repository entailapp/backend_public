import {Logger, ValidationPipe} from '@nestjs/common';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {NestExpressApplication} from '@nestjs/platform-express';
import compression from 'compression';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import {DocumentBuilder, OpenAPIObject, SwaggerModule} from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import {SamplingContext} from '@sentry/types';
import {ConfigService} from '@nestjs/config';
import {RequestHandler} from '@nestjs/common/interfaces';

/**
 * Bootstrap the webserver and initialise all its middleware
 */
async function bootstrap(): Promise<void> {
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule);
  // Import the configuration service first
  const configService = app.get(ConfigService);
  const globalPrefix = 'api';
  const swaggerRoute = globalPrefix + '/swagger';
  const port: string | number = configService.get('PORT') || 3333;
  /**
   * Options:
   * node_modules/.pnpm/@sentry+node@6.4.1/node_modules/@sentry/node/dist/backend.d.ts
   * node_modules/.pnpm/@sentry+types@6.4.1/node_modules/@sentry/types/dist/options.d.ts
   *
   * The rest of the integration is handled by https://github.com/mentos1386/nest-raven starting in app.module.ts
   */
  configService.get<string>('DGRAPH_ADDRS');
  Sentry.init({
    enabled: configService.get<boolean>('SENTRY_ENABLED'),
    debug: configService.get<boolean>('SENTRY_DEBUG'),
    dsn: configService.get('SENTRY_DSN'),
    serverName: configService.get('SENTRY_SERVER_NAME'),
    environment: configService.get('NODE_ENV'),
    release: configService.get('RELEASE'),
    logLevel: configService.get('SENTRY_LOGLEVEL'),
    sampleRate: 1.0, // TODO: Adjust for production
    attachStacktrace: true,
    autoSessionTracking: true,
    integrations: [
      new Sentry.Integrations.Http({breadcrumbs: true, tracing: true}),
      new Tracing.Integrations.Express({
        app: app.getHttpServer().app,
      }),
    ],
    tracesSampler: (samplingContext: SamplingContext) => {
      if (
        ((samplingContext.request ?? {url: ''}).url ?? '').match(
          new RegExp(`^https?://[a-zA-Z0-9]+(.[a-zA-Z]+)?/${swaggerRoute}/.*$`) // Filter out swagger
        )
      ) {
        return 0;
      } else {
        // Default sample rate for all others (replaces tracesSampleRate)
        // TODO: Adjust in production to lower amount of reports we get
        return 1; // This is a float btw
      }
    },
  });
  app
    .setGlobalPrefix(globalPrefix)
    .use(Sentry.Handlers.requestHandler() as RequestHandler)
    .use(Sentry.Handlers.tracingHandler())
    .use(compression())
    .use(helmet())
    .use(cookieParser())
    .useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      })
    )
    .set('trust proxy', 'uniquelocal');
  app.enableCors();
  app.enableShutdownHooks();
  const config = new DocumentBuilder()
    .setTitle('Entail')
    .setDescription('Entail Backend API')
    .setVersion('v0.1.0')
    .build();
  const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerRoute, app, document);

  await app.listen(port, (): void => {
    Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix + '/');
  });
}

bootstrap().then();
