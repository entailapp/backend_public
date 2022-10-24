import {Profile} from '../entities/profile.entity';
import {IntersectionType, PartialType} from '@nestjs/swagger';
import {BaseEntity} from '../../shared/baseEntity.entity';

export class SearchProfileInternalDto extends PartialType(IntersectionType(Profile, BaseEntity)) {}
