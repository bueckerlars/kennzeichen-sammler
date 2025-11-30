import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { UserCollection } from './UserCollection';

@Entity('license_plates')
export class LicensePlate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  code!: string;

  @Column()
  city!: string;

  @Column({ nullable: true })
  region?: string;

  @Column()
  state!: string;

  @OneToMany(() => UserCollection, (collection) => collection.licensePlate)
  collections!: UserCollection[];
}

