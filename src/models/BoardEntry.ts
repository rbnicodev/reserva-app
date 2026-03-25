import type { Timestamp } from "firebase/firestore";

export interface BoardEntry {
    id: string;
    title: string;
    subtitle: string;
    content: string;
    order: Timestamp;
    urlImage?: string;
    footer?: string;
    active?: boolean;
}