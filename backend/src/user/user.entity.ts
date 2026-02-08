import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum UserType {
  HANDICAP = 'handicap',
  ACCOMPAGNANT = 'accompagnant',
}

export enum HandicapType {
  MOTEUR = 'moteur',
  VISUEL = 'visuel',
  AUDITIF = 'auditif',
  COGNITIF = 'cognitif',
}

export enum AccompagnantType {
  FAMILLE = 'famille',
  AIDE_SOIGNANT = 'aide_soignant',
  BENEVOLE = 'benevole',
  CHAUFFEUR_SOLIDAIRE = 'chauffeur_solidaire',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  username: string | null;

  @Column({ type: 'varchar', nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', nullable: true })
  lastName: string | null;

  @Column({ type: 'varchar', nullable: true })
  phoneNumber: string | null;

  @Column({
    type: 'enum',
    enum: UserType,
    nullable: true,
    default: UserType.HANDICAP,
  })
  userType: UserType | null;

  @Column({
    type: 'enum',
    enum: HandicapType,
    nullable: true,
  })
  handicapType: HandicapType | null;

  @Column({
    type: 'enum',
    enum: AccompagnantType,
    nullable: true,
  })
  accompagnantType: AccompagnantType | null;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  verificationCode: string | null;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordCode: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}