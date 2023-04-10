declare function createSVG(drawConfig: DrawConfig): d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
declare function replaceAll(string: string | undefined, search: string, replace: string): string | undefined;
declare function wrapAxisText(text: d3.Selection<d3.BaseType, unknown, SVGGElement, any>, width: number): void;
declare const tooltipElement: d3.Selection<d3.BaseType, unknown, HTMLElement, any>;
declare function enableTooltip<Datum, PDatum>(sel: d3.Selection<d3.BaseType, Datum, d3.BaseType, PDatum>, ttFn: (d: Datum) => string | undefined): void;
type DataMapperFn<T, D> = (data: T[]) => ChartData<D>;
interface ChartData<D> {
    data: D[];
    unknownCount: number;
}
declare function elementMapper<T, D>(mapFn: (d: T) => D | undefined): DataMapperFn<T, D>;
declare function aggregateMapper<T, D>(bucketFn: (d: T) => string | undefined, mapFn: (bucket: string, count: number) => D): DataMapperFn<T, D>;
declare function weekMapper<T, D>(bucketFn: (d: T) => string | undefined, mapFn: (bucket: string, count: number) => D): DataMapperFn<T, D>;
declare function straightMapper<T, D>(bucketFn: (d: T) => string | undefined, mapFn: (bucket: string, count: number) => D, valueStr: keyof T): DataMapperFn<T, D>;
declare function timePieMapper<T, D>(bucketFn: (d: T) => string | undefined, mapFn: (bucket: string, count: number) => D): DataMapperFn<T, D>;
declare function emptyMapper<T, D>(bucketFn: (d: T) => string | undefined, mapFn: (bucket: string, count: number) => D, valueStr: string): DataMapperFn<T, D>;
declare function binMapper<T>(mapFn: (d: T) => number | undefined, binConfig?: {
    bins?: number;
}): DataMapperFn<T, d3.Bin<number, number>>;
declare function thresholdTime(n: number): (_data: ArrayLike<Date>, min: Date, max: Date) => Date[];
declare function binDateMapper<T>(mapFn: (d: T) => Date | undefined, binConfig?: {
    bins?: number | "months";
}): DataMapperFn<T, d3.Bin<Date, Date>>;
declare function binDateDayMapper<T>(mapFn: (d: T) => Date | undefined, binConfig: {
    bins: "months" | "weeks" | "days" | number;
    startOfWeek?: number;
    dayOfMonth?: number;
}): DataMapperFn<T, d3.Bin<Date, Date>>;
//# sourceMappingURL=utils.d.ts.map