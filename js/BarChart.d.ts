interface CommonBarConfig {
    labelOrder?: string[];
    labelSort?: (a: string, b: string) => number;
    sort?: (a: BarData, b: BarData) => number;
    colorScheme?: readonly string[];
}
interface BarConfig extends CommonBarConfig, XYChartConfig<BarData, string, number> {
}
interface HorizontalBarConfig extends CommonBarConfig, XYChartConfig<BarData, number, string> {
}
interface BarData {
    label: string;
    value: number;
    tooltip?: string;
    color?: string;
}
declare class BarChart<T> extends AbstractXYChart<T, BarData, "label", "value", BarConfig> {
    protected xScale: d3.ScaleBand<string>;
    protected yScale: d3.ScaleLinear<number, number, never>;
    protected xAxis: d3.Axis<string>;
    protected yAxis: d3.Axis<number>;
    protected cScale?: d3.ScaleOrdinal<string, string>;
    setData(sourceData: T[]): void;
    constructor(rawData: T[], dataMapper: DataMapperFn<T, BarData>, barConfig: BarConfig, drawConfig: DrawConfig);
    render(): void;
}
declare class HorizontalBarChart<T> extends AbstractXYChart<T, BarData, "value", "label", HorizontalBarConfig> {
    protected xScale: d3.ScaleLinear<number, number, never>;
    protected yScale: d3.ScaleBand<string>;
    protected xAxis: d3.Axis<number>;
    protected yAxis: d3.Axis<string>;
    protected cScale?: d3.ScaleOrdinal<string, string>;
    setData(sourceData: T[]): void;
    constructor(rawData: T[], dataMapper: DataMapperFn<T, BarData>, barConfig: HorizontalBarConfig, drawConfig: DrawConfig);
    render(): void;
}
//# sourceMappingURL=BarChart.d.ts.map