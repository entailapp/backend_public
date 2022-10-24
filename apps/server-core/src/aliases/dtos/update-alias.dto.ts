import {CreateAliasDto} from './create-alias.dto';
import {PartialType, PickType} from '@nestjs/swagger';

export class UpdateAliasDto extends PickType(PartialType(CreateAliasDto), [
  'displayName',
  'pronouns',
  'bio',
  'aboutPage',
  'avatar',
  'banner',
  'location',
  'website',
  'following',
  'tags',
  'liked',
  'boosted',
  'shared',
  'nsfw',
  'isNSFW',
]) {}
