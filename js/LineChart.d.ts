interface LineConfig extends XYChartConfig<Point2D, number, number> {
    xScale?: "linear" | "log";
    yScale?: "linear" | "log";
}
declare class LineChart<T> extends AbstractXYChart<T, Point2D, "x", "y", LineConfig> {
    protected xScale: d3.ScaleContinuousNumeric<number, number, never>;
    protected yScale: d3.ScaleContinuousNumeric<number, number, never>;
    protected xAxis: d3.Axis<number>;
    protected yAxis: d3.Axis<number>;
    setData(sourceData: T[]): void;
    constructor(rawData: T[], dataMapper: DataMapperFn<T, Point2D>, lineConfig: LineConfig, drawConfig: DrawConfig);
    render(): void;
}
//# sourceMappingURL=LineChart.d.ts.map