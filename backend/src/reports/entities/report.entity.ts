import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  student: string;

  @Column()
  faculty: string;

  @Column()
  type: string; // e.g. 'internship', 'audit', 'logbook'

  @Column()
  url: string; // path to CSV file

  @CreateDateColumn()
  createdAt: Date;
}