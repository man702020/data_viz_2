declare function parseRecord(row: d3.DSVRowString<string>): CallData;
type FilterFn = (d: CallData) => boolean | undefined | 0;
declare function visualizeData(data: CallData[]): void;
declare const MONTH_NAMES: string[];
//# sourceMappingURL=index.d.ts.map