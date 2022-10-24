import {CreateProfileDto} from './create-profile.dto';
import {ApiProperty, PartialType, PickType} from '@nestjs/swagger';
import {IsArray, IsDateString, IsEmail, IsString} from 'class-validator';

export class UpdateProfileDto extends PickType(PartialType(CreateProfileDto), [
  'firstName',
  'lastName',
  'email',
  'dob',
  'aliases',
  'updatedAt',
]) {
  @ApiProperty()
  @IsString()
  firstName?: string;
  @ApiProperty()
  @IsString()
  lastName?: string;
  @ApiProperty()
  @IsEmail()
  email?: string;
  @ApiProperty()
  @IsDateString()
  dob?: string;
  @ApiProperty()
  @IsArray()
  aliases?: string[];
}
