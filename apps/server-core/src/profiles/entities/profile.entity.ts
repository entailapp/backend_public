import {BaseEntity} from '../../shared/baseEntity.entity';
import {DateTime} from 'luxon';

export class Profile extends BaseEntity {
  authId!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
  dob!: DateTime;
  is18!: boolean;
  aliases!: string[];
}
