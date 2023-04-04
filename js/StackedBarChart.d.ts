interface StackedBarData {
    xValue: string;
    yValue: number;
    zValue: number;
    aValue: number;
}
declare class StackedBarChart {
    data: StackedBarData[];
    protected drawConfig: DrawConfig;
    protected svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    protected ctx: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    protected margin: Margin;
    protected xScale: d3.ScaleBand<string>;
    protected yScale: d3.ScaleLinear<number, number, never>;
    protected xAxis: d3.Axis<string>;
    protected yAxis: d3.Axis<number>;
    protected xAxisG: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    protected yAxisG: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    protected cScale: d3.ScaleOrdinal<string, string>;
    protected stack: d3.Stack<unknown, StackedBarData, "yValue" | "zValue" | "aValue">;
    protected stackData: d3.Series<StackedBarData, "yValue" | "zValue" | "aValue">[];
    constructor(data: StackedBarData[], drawConfig: DrawConfig);
    updateVis(): void;
    renderVis(): void;
}
//# sourceMappingURL=StackedBarChart.d.ts.map