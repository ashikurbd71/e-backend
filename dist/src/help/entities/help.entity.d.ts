export declare enum SupportStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    RESOLVED = "resolved"
}
export declare class Help {
    id: number;
    email: string;
    issue: string;
    status: SupportStatus;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
