import {IsEmail, IsString, IsDateString, IsArray} from 'class-validator';
import {ApiProperty, OmitType} from '@nestjs/swagger';
import {Profile} from '../entities/profile.entity';

export class CreateProfileDto extends OmitType(Profile, ['is18', 'dob']) {
  @ApiProperty()
  @IsString()
  authId!: string;
  @ApiProperty()
  @IsString()
  firstName!: string;
  @ApiProperty()
  @IsString()
  lastName!: string;
  @ApiProperty()
  @IsEmail()
  email!: string;
  @ApiProperty()
  @IsDateString()
  dob!: string;
  @ApiProperty()
  @IsArray()
  aliases!: string[];
}
