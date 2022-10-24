import {BaseEntity} from '../../shared/baseEntity.entity';

// TODO: Model facets on 'liked', 'boosted' and 'shared'. See schema.md.

export class Alias extends BaseEntity {
  username!: string;
  displayName!: string;
  pronouns!: string;
  bio!: string;
  aboutPage!: string;
  avatar!: string;
  banner!: string;
  location!: string;
  website!: string;
  following!: string[];
  tags!: string[];
  liked!: string[];
  boosted!: string[];
  shared!: string[];
  nsfw!: string;
  isNSFW!: boolean;
}
