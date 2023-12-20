import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class UserCategory {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column({ type: "longtext", nullable: true })
  keywords: string;
  @JoinColumn()
  @ManyToOne(() => User)
  user: User;
  @JoinColumn()
  @ManyToOne(() => UserCategory, (userCategory) => userCategory.id)
  parent: UserCategory | null;
  @OneToMany(() => UserCategory, (userCategory) => userCategory.parent, { cascade: true })
  childs?: UserCategory[] | null;
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", select: false })
  created: Date;
  @Column({
    type: "timestamp",
    default: null,
    onUpdate: "CURRENT_TIMESTAMP",
    select: false,
  })
  updated: Date | null;
}
