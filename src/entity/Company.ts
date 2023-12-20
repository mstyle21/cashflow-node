import { AfterInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import MysqlDataSource from "../config/data-source";

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: "text" })
  name: string;
  @Column({ type: "longtext" })
  keywords: string;
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
