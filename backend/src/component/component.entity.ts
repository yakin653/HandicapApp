import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Component {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  imageUrl: string;
}
