


interface ScatterConfig extends XYChartConfig<ScatterData, number, number> {
    xScale?: "linear" | "log";
    yScale?: "linear" | "log";
}

interface ScatterData extends Point2D {
    r?: number;
    color?: string;
    className?: string;
    tooltip?: string;
}

class ScatterPlot<T> extends AbstractXYChart<T, ScatterData, "x", "y", ScatterConfig>
{
    protected xScale: d3.ScaleContinuousNumeric<number, number, never>;
    protected yScale: d3.ScaleContinuousNumeric<number, number, never>;
    protected xAxis: d3.Axis<number>;
    protected yAxis: d3.Axis<number>;



    public constructor(
        rawData: T[],
        dataMapper: DataMapperFn<T, ScatterData>,
        scatterConfig: ScatterConfig,
        drawConfig: DrawConfig,
    ) {
        super(rawData, dataMapper, scatterConfig, drawConfig);

        const xDomain = d3.extent(this.data, ({ x }) => x) as  [number, number];
        const yDomain = d3.extent(this.data, ({ y }) => y) as  [number, number];

        this.xScale = this.chartConfig.xScale === "log" ?
            d3.scaleLog(xDomain, [0, drawConfig.width]) :
            d3.scaleLinear(xDomain, [0, drawConfig.width]);
        this.yScale = this.chartConfig.xScale === "log" ?
            d3.scaleLog(yDomain, [drawConfig.height, 0]) :
            d3.scaleLinear(yDomain, [drawConfig.height, 0]);

        this.xAxis = d3.axisBottom<number>(this.xScale);
        this.yAxis = d3.axisLeft<number>(this.yScale);

        this.renderAxes();
        this.render();
    }

    public render() {
        const pointSel = this.ctx.selectAll(".scatter-point")
            .data(this.data).join("circle")
                .attr("class", (d) => `scatter-point data-element ${d.className}`)
                .attr("cx", (d) => this.xScale(d.x)!)
                .attr("cy", (d) => this.yScale(d.y))
                .attr("r", (d) => d.r || 2)
                .attr("fill", (d) => d.color || "#000");

        enableTooltip(pointSel, (d) => d.tooltip);
        this.renderUnknown();
    }
}
