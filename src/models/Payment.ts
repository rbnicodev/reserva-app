export interface Payment {
    id?: string;
    name?: string;
    isCouple?: boolean;
    createDate?: string; //Date
    deadLine?: string //Date
}

export type PaymentForUserProps = {
    id?: string;
    idPayment?: string;
    idUser?: string;
    amount?: number;
    paid?: number;
};

export class PaymentForUser {
    id?: string;
    idPayment?: string;
    idUser?: string;
    amount: number = 0;
    paid: number = 0;

    constructor(data: PaymentForUserProps) {
        Object.assign(this, data);
    }

    isPaid(): boolean {
        return this.amount <= this.paid;
    }
}
