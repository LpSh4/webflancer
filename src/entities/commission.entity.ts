import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import type { Relation } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Client } from "./user.entity.client";
import { Developer } from "./user.entity.developer";
import { Bid } from "./bid.entity";
import { CommissionLog } from "./log.commission.entity";
import { CommissionProposal } from "./commission.entity.proposals";
import {
  CommissionProgress,
  CommissionWorkStatus,
  ProposalStatus,
} from "./commission.enums";

export enum CommissionType {
  // Simple / Content Focused
  LANDING_PAGE = "LANDING_PAGE",
  PORTFOLIO = "PORTFOLIO",
  BLOG_NEWS = "BLOG_NEWS",
  PROMOTIONAL_MICROSITE = "PROMOTIONAL_MICROSITE",

  // Business & Corporate
  CORPORATE_BUSINESS = "CORPORATE_BUSINESS",
  NON_PROFIT_CHARITY = "NON_PROFIT_CHARITY",
  EDUCATIONAL_LMS = "EDUCATIONAL_LMS",

  // E-Commerce
  E_COMMERCE_STORE = "E_COMMERCE_STORE",
  MARKETPLACE = "MARKETPLACE",
  BOOKING_RESERVATION = "BOOKING_RESERVATION",

  // Technical & Functional
  SPA = "SPA",
  PWA = "PWA",
  SAAS_DASHBOARD = "SAAS_DASHBOARD",
  CRM_ERP_SYSTEM = "CRM_ERP_SYSTEM",
  SOCIAL_NETWORK = "SOCIAL_NETWORK",
  FORUM_COMMUNITY = "FORUM_COMMUNITY",

  // Specialized
  RE_ESTATE_LISTING = "RE_ESTATE_LISTING",
  PORTAL_INTRANET = "PORTAL_INTRANET",
  WIKI_KNOWLEDGE_BASE = "WIKI_KNOWLEDGE_BASE",

  // Generic fallback
  CUSTOM_DEVELOPMENT = "CUSTOM_DEVELOPMENT",
  OTHER = "OTHER",
}

@Entity()
export class Commission extends BaseEntity {
  @Column({ type: "varchar", name: "client_id" })
  clientId!: string;

  @ManyToOne(() => Client, (client) => client.commissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "client_id",
  })
  client!: Relation<Client>;

  @Column({ type: "varchar", name: "developer_id", nullable: true })
  developerId?: string;

  @ManyToOne(() => Developer, (developer) => developer.orders, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    name: "developer_id",
  })
  developer?: Relation<Developer>;

  @Column({
    type: "enum",
    enum: CommissionType,
    default: CommissionType.LANDING_PAGE,
  })
  commissionType!: CommissionType;

  @Column({
    type: "enum",
    enum: CommissionProgress,
    default: CommissionProgress.POSTED,
  })
  commissionProgress!: CommissionProgress;

  @Column({
    type: "enum",
    enum: CommissionWorkStatus,
    default: CommissionWorkStatus.PENDING,
  })
  commissionWorkStatus!: CommissionWorkStatus;

  @Column({ type: "varchar", default: "Website commission" })
  title!: string;

  @Column({ type: "varchar", default: "" })
  description!: string;

  @Column({ type: "varchar", default: "" })
  functionality?: string;

  @Column({ type: "varchar", default: "" })
  designLink?: string;

  @Column({ type: "int", default: 0 })
  budgetMin!: number;

  @Column({ type: "int", default: null, nullable: true })
  budgetMax!: number | null;

  @Column({ type: "timestamp", nullable: true, default: null })
  deadline?: Date | null;

  @Column({ type: "text", array: true, default: [] })
  references?: string[];

  @OneToMany(() => Bid, (bid) => bid.commission, { onDelete: "CASCADE" })
  bids?: Relation<Bid[]>;

  @OneToMany(() => CommissionLog, (log) => log.commission, {
    onDelete: "CASCADE",
  })
  logs?: Relation<CommissionLog[]>;

  @OneToMany(() => CommissionProposal, (proposal) => proposal.commission, {
    onDelete: "CASCADE",
  })
  proposals?: Relation<ProposalStatus[]>;
}
