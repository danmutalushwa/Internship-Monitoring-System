import { Entity, ManyToOne, JoinColumn, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true }) 
  email!: string;

  @Column()
  role!: string;

  @Column({ nullable: true })
  faculty?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'lecturerId' })
  lecturer?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewerId' })
  reviewer?: User;
}
