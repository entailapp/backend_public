import {ChannelCredentials} from '@grpc/grpc-js';
import {ConfigService} from '@nestjs/config';

export interface NestDgraphOptions {
  clientStubs: {
    address: string;
    credentials: ChannelCredentials;
    options?: object;
  }[];
  debug?: boolean;
}

export interface NestDgraphModuleOptions {
  NestDgraphOptionsFactory: {
    useFactory: (config: ConfigService) => {
      clientStubs: {
        address: string;
        credentials: ChannelCredentials;
        options?: object;
      }[];
      debug?: boolean;
    };
    inject: any[];
  };
}
