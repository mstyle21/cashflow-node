import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { Company } from "./Company";
import { Location } from "./Location";
import { ExpenditureImage } from "./ExpenditureImage";
import { ExpenditureItem } from "./ExpenditureItem";

@Entity()
export class Expenditure {
  @PrimaryGeneratedColumn()
  id: number;
  @JoinColumn()
  @ManyToOne(() => User)
  user: User;
  @JoinColumn()
  @ManyToOne(() => Company)
  company: Company;
  @JoinColumn()
  @ManyToOne(() => Location)
  location: Location;
  @Column()
  totalPrice: number;
  @Column({ type: "date" })
  purchaseDate: string;
  @JoinColumn()
  @OneToMany(() => ExpenditureImage, (image) => image.expenditure, { cascade: true })
  images: ExpenditureImage[];
  @JoinColumn()
  @OneToMany(() => ExpenditureItem, (item) => item.expenditure, { cascade: true })
  items: ExpenditureItem[];
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
