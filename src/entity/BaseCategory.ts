import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class BaseCategory {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column({ type: "longtext" })
  keywords: string;
  @JoinColumn()
  @ManyToOne(() => BaseCategory, (baseCategory) => baseCategory.id)
  parent: BaseCategory | null;
  @OneToMany(() => BaseCategory, (baseCategory) => baseCategory.parent)
  childs?: BaseCategory[] | null;
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
