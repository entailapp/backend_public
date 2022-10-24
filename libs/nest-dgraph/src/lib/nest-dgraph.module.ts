import {DynamicModule, Global, Module, OnModuleDestroy, Provider} from '@nestjs/common';
import {NestDgraphService} from './nest-dgraph.service';
import {ModuleRef} from '@nestjs/core';
import {NestDgraphModuleOptions} from './interfaces/options.interface';

@Global()
@Module({
  providers: [NestDgraphService],
  exports: [NestDgraphService],
})
export class NestDgraphModule implements OnModuleDestroy {
  constructor(private readonly moduleRef: ModuleRef) {}

  static forRoot(options: NestDgraphModuleOptions): DynamicModule {
    const dgraphModuleOptions: Provider = {
      provide: 'NestDgraphOptions',
      ...options.NestDgraphOptionsFactory,
    };
    return {
      module: NestDgraphModule,
      providers: [dgraphModuleOptions, NestDgraphService],
      exports: [NestDgraphService],
    };
  }

  async onModuleDestroy() {
    this.moduleRef.get<NestDgraphService>(NestDgraphService).destroy();
  }
}
