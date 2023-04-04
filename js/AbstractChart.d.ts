interface VisualizationConfig<D> {
    onDataSelect?: (data: D) => void;
}
interface ChartConfig<D> extends VisualizationConfig<D> {
    hideUnknown?: boolean;
    title?: string;
}
declare abstract class AbstractVisualization<T, D, Config extends VisualizationConfig<D>> {
    protected data: D[];
    protected unknownPoints: number;
    protected abstract dataMapper: DataMapperFn<T, D>;
    protected abstract chartConfig: Config;
    setData(sourceData: T[]): void;
    abstract render(): void;
}
declare abstract class AbstractChart<T, D, Config extends ChartConfig<D>> extends AbstractVisualization<T, D, Config> {
    protected dataMapper: DataMapperFn<T, D>;
    protected chartConfig: Config;
    protected drawConfig: DrawConfig;
    protected svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    protected ctx: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    protected margin: Margin;
    protected constructor(rawData: T[], dataMapper: DataMapperFn<T, D>, chartConfig: Config, drawConfig: DrawConfig);
    renderUnknown(): void;
}
interface XYChartConfig<D, X, Y> extends ChartConfig<D> {
    xAxisLabel: string;
    xTickFormat?: (d: X) => string;
    yAxisLabel: string;
    yTickFormat?: (d: Y) => string;
}
declare abstract class AbstractXYChart<T, D, XKey extends keyof D, YKey extends keyof D, Config extends XYChartConfig<D, D[XKey], D[YKey]>> extends AbstractChart<T, D, Config> {
    protected abstract xAxis: d3.Axis<D[XKey]>;
    protected abstract yAxis: d3.Axis<D[YKey]>;
    protected renderAxes(xWrapWidth?: number): void;
}
//# sourceMappingURL=AbstractChart.d.ts.map