import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsArray, Matches, IsBoolean} from 'class-validator';

// TODO: Proper validation for 'aboutPage', 'avatar' and 'banner'.

export class CreateAliasDto {
  @ApiProperty()
  @IsString()
  username!: string;
  @ApiProperty()
  @IsString()
  displayName!: string;
  @ApiProperty()
  @IsString()
  pronouns!: string;
  @ApiProperty()
  @IsString()
  bio!: string;
  @ApiProperty()
  aboutPage!: string;
  @ApiProperty()
  avatar!: string;
  @ApiProperty()
  banner!: string;
  @ApiProperty()
  @IsString()
  location!: string;
  @ApiProperty()
  @IsString()
  website!: string;
  @ApiProperty()
  @IsArray()
  following!: string[];
  @ApiProperty()
  @IsArray()
  tags!: string[];
  @ApiProperty()
  @IsArray()
  liked!: string[];
  @ApiProperty()
  @IsArray()
  boosted!: string[];
  @ApiProperty()
  @IsArray()
  shared!: string[];
  @ApiProperty()
  @Matches('nsfw|adult|sfw')
  nsfw!: string;
  @ApiProperty()
  @IsBoolean()
  isNSFW!: boolean;
}
