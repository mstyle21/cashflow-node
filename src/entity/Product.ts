import { Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ExpenditureItem } from "./ExpenditureItem";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "text" })
  name: string;
  @Column({ type: "text" })
  description: string;
  @JoinColumn()
  @OneToMany(() => ExpenditureItem, (expenditureItem) => expenditureItem.product)
  expenditureItems: ExpenditureItem[];
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
