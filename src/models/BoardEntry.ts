export interface BoardEntry {
    id: string;
    title: string;
    subtitle: string;
    content: string;
    order: number;
    urlImage?: string;
    footer?: string;
}