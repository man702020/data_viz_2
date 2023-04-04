


interface LineConfig extends XYChartConfig<Point2D, number, number> {
    xScale?: "linear" | "log";
    yScale?: "linear" | "log";
}

class LineChart<T> extends AbstractXYChart<T, Point2D, "x", "y", LineConfig>
{
    protected xScale!: d3.ScaleContinuousNumeric<number, number, never>;
    protected yScale!: d3.ScaleContinuousNumeric<number, number, never>;
    protected xAxis!: d3.Axis<number>;
    protected yAxis!: d3.Axis<number>;



    public setData(sourceData: T[]): void {
        super.setData(sourceData);



        const xDomain = d3.extent(this.data, ({ x }) => x) as  [number, number];
        const yDomain = d3.extent(this.data, ({ y }) => y) as  [number, number];

        this.xScale = this.chartConfig.xScale === "log" ?
            d3.scaleLog(xDomain, [0, this.drawConfig.width]) :
            d3.scaleLinear(xDomain, [0, this.drawConfig.width]);
        this.yScale = this.chartConfig.xScale === "log" ?
            d3.scaleLog(yDomain, [this.drawConfig.height, 0]) :
            d3.scaleLinear(yDomain, [this.drawConfig.height, 0]);

        this.xAxis = d3.axisBottom<number>(this.xScale);
        if(this.chartConfig.xTickFormat) {
            this.xAxis.tickFormat(this.chartConfig.xTickFormat);
        }
        this.yAxis = d3.axisLeft<number>(this.yScale);
        if(this.chartConfig.yTickFormat) {
            this.yAxis.tickFormat(this.chartConfig.yTickFormat);
        }

        this.renderAxes();
    }


    public constructor(
        rawData: T[],
        dataMapper: DataMapperFn<T, Point2D>,
        lineConfig: LineConfig,
        drawConfig: DrawConfig,
    ) {
        super(rawData, dataMapper, lineConfig, drawConfig);

        this.ctx.append("polyline")
            .attr("class", "line-plot-line");
        this.render();
    }

    public render() {
        this.ctx.select(".line-plot-line")
            .attr("points", this.data.map(({ x, y }) => `${this.xScale(x)},${this.yScale(y)}`).join(" "))
            .attr("stroke", "#000")
            .attr("fill", "none");
    }
}
