// place files you want to import through the `$lib` alias in this folder.
export type Branch = {
    id: string;
    name: string;
    status: boolean;
    createdAt: string;
    organization: {
        id: string;
        name: string;
    } | null;
};