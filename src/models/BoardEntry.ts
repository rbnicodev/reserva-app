export interface BoardEntry {
    id: string;
    title: string;
    subtitle: string;
    content: string;
    order: Date;
    urlImage?: string;
    footer?: string;
    active?: boolean;
}