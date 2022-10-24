// TODO: Add documentation and OpenAPI examples
// TODO: Write tests
import {Body, Controller, Delete, Get, Param, Patch, Post} from '@nestjs/common';
import {CreateProfileDto} from './dtos/create-profile.dto';
import {ProfilesService} from './profiles.service';
import {UpdateProfileDto} from './dtos/update-profile.dto';

@Controller('users')
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Get(':id')
  async getProfile(@Param('id') uid: string) {
    const searchResult = await this.profilesService.getProfileByUid(uid);
    return searchResult.isOk() ? searchResult.unwrap() : searchResult.unwrapErr();
  }

  @Post()
  async createProfile(@Body() profile: CreateProfileDto) {
    const createResult = await this.profilesService.createProfile(profile);
    return createResult.isOk() ? createResult.unwrap() : createResult.unwrapErr();
  }

  @Patch(':id')
  async updateProfile(@Body() profile: UpdateProfileDto, @Param('id') authId: string) {
    const updateResult = await this.profilesService.updateProfile(authId, profile);
    return updateResult.isOk() ? updateResult.unwrap() : updateResult.unwrapErr();
  }

  @Delete(':id')
  async deleteProfile(@Param('id') authId: string) {
    const deleteResult = await this.profilesService.deleteProfile(authId);
    if (deleteResult.isErr()) {
      return deleteResult.unwrapErr();
    } else {
      return;
    }
  }
}
