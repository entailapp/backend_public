import {Module} from '@nestjs/common';
import {AliasesController} from './aliases.controller';
import {AliasesService} from './aliases.service';

@Module({
  controllers: [AliasesController],
  providers: [AliasesService],
  imports: [],
})
export class AliasesModule {}
