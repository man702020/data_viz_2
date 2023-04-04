interface HistogramConfig<X extends number | Date> extends XYChartConfig<d3.Bin<X, X>, X, number> {
    color?: string;
    bins?: number;
    tooltipFn?: (d: d3.Bin<X, X>) => string;
    onRegionSelect?: (region: [X, X]) => void;
}
declare class HistogramChart<T> extends AbstractChart<T, d3.Bin<number, number>, HistogramConfig<number>> {
    protected xScale: d3.ScaleLinear<number, number, never>;
    protected yScale: d3.ScaleLinear<number, number, never>;
    protected xAxis: d3.Axis<number>;
    protected yAxis: d3.Axis<number>;
    setData(sourceData: T[]): void;
    constructor(rawData: T[], dataMapper: DataMapperFn<T, d3.Bin<number, number>>, histogramConfig: HistogramConfig<number>, drawConfig: DrawConfig);
    protected renderAxes(xWrapWidth?: number): void;
    render(): void;
}
declare class DateHistogramChart<T> extends AbstractChart<T, d3.Bin<Date, Date>, HistogramConfig<Date>> {
    protected xScale: d3.ScaleTime<number, number, never>;
    protected yScale: d3.ScaleLinear<number, number, never>;
    protected xAxis: d3.Axis<Date | number>;
    protected yAxis: d3.Axis<number>;
    protected brush: d3.BrushBehavior<unknown>;
    protected brushG: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    setData(sourceData: T[]): void;
    setDataMapper(sourceData: T[], dataMapper: DataMapperFn<T, d3.Bin<Date, Date>>): void;
    constructor(rawData: T[], dataMapper: DataMapperFn<T, d3.Bin<Date, Date>>, histogramConfig: HistogramConfig<Date>, drawConfig: DrawConfig);
    protected renderAxes(xWrapWidth?: number): void;
    render(): void;
    private onBrush;
}
declare function getBinExtent(data: d3.Bin<number, number>[]): number[];
declare function getDateBinExtent(data: d3.Bin<Date, Date>[]): [Date, Date];
//# sourceMappingURL=Histogram.d.ts.map