import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';
import { LicensePlate } from './LicensePlate';

@Entity('user_collections')
@Index(['user', 'licensePlate'], { unique: true })
export class UserCollection {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.collections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @ManyToOne(() => LicensePlate, (plate) => plate.collections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'licensePlateId' })
  licensePlate!: LicensePlate;

  @Column()
  licensePlateId!: string;

  @Column({ type: 'date' })
  spottedDate!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}

