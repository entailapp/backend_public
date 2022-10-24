import {Body, Controller, Delete, Get, Param, Patch, Post} from '@nestjs/common';
import {AliasesService} from './aliases.service';
import {CreateAliasDto} from './dtos/create-alias.dto';
import {UpdateAliasDto} from './dtos/update-alias.dto';

@Controller('aliases')
export class AliasesController {
  constructor(private aliasesService: AliasesService) {}

  @Get(':id')
  async getAlias(@Param('id') id: string) {
    const searchResult = await this.aliasesService.getAlias(id);
    return searchResult.isOk() ? searchResult.unwrap() : searchResult.unwrapErr();
  }

  @Post()
  async createAlias(@Body() alias: CreateAliasDto) {
    const createResult = await this.aliasesService.createAlias(alias);
    return createResult.isOk() ? createResult.unwrap() : createResult.unwrapErr();
  }

  @Patch(':id')
  async updateAlias(@Body() alias: UpdateAliasDto, @Param('id') uid: string) {
    const updateResult = await this.aliasesService.updateAlias(uid, alias);
    return updateResult.isOk() ? updateResult.unwrap() : updateResult.unwrapErr();
  }

  @Delete(':id')
  async deleteAlias(@Param('id') uid: string) {
    const deleteResult = await this.aliasesService.deleteAlias(uid);
    return deleteResult.isOk() ? deleteResult.unwrap() : deleteResult.unwrapErr();
  }
}
