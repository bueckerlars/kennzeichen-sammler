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

  @Column({ type: 'varchar', unique: true })
  code!: string;

  @Column({ type: 'varchar' })
  city!: string;

  @Column({ type: 'varchar', nullable: true })
  region?: string;

  @Column({ type: 'varchar' })
  state!: string;

  @OneToMany(() => UserCollection, (collection) => collection.licensePlate)
  collections!: UserCollection[];
}

