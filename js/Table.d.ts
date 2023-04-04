interface TableHeaderInfo<T> {
    key: keyof T;
    title: string;
}
interface TableConfig<T> {
    onHover(data: T): void;
}
declare class Table<T extends Record<string, any>> {
    private headers;
    private data;
    private parent;
    private config?;
    private table;
    private thead;
    private tbody;
    constructor(headers: TableHeaderInfo<T>[], data: T[], parent: string, config?: TableConfig<T> | undefined);
    render(): void;
}
//# sourceMappingURL=Table.d.ts.map