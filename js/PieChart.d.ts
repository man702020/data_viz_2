interface PieConfig extends ChartConfig<PieData> {
    colorScheme?: readonly string[];
    legend?: boolean;
}
interface PieData {
    value: number;
    label: string;
    color?: string;
}
declare class PieChart<T> extends AbstractChart<T, PieData, PieConfig> {
    protected legend?: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    protected total: number;
    protected thetaScale: d3.ScaleContinuousNumeric<number, number, never>;
    protected cScale?: d3.ScaleOrdinal<string, string>;
    protected cx: number;
    protected cy: number;
    protected radius: number;
    private sliceArcCounter;
    setData(sourceData: T[]): void;
    constructor(rawData: T[], dataMapper: DataMapperFn<T, PieData>, pieConfig: PieConfig, drawConfig: DrawConfig);
    renderLegend(): void;
    render(): void;
    protected slice2path(d: PieData, theta?: number): string;
}
//# sourceMappingURL=PieChart.d.ts.map