


interface VisualizationConfig<D> {
    onDataSelect?: (data: D) => void;
}
interface ChartConfig<D> extends VisualizationConfig<D> {
    hideUnknown?: boolean;
    title?: string;
}

abstract class AbstractVisualization<T, D, Config extends VisualizationConfig<D>> {
    protected data: D[] = [];
    protected unknownPoints = 0;

    protected abstract dataMapper: DataMapperFn<T, D>;
    protected abstract chartConfig: Config;

    public setData(sourceData: T[]) {
        if(sourceData.length === 0) {
            this.data = [];
            this.unknownPoints = 0;
        } else {
            const chartData = this.dataMapper(sourceData);
            this.data = chartData.data;
            this.unknownPoints = chartData.unknownCount;
        }
    }

    public abstract render(): void;
}

abstract class AbstractChart<T, D, Config extends ChartConfig<D>> extends AbstractVisualization<T, D, Config>
{
    protected svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    protected ctx: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

    protected margin: Margin;



    protected constructor(
        rawData: T[],
        protected dataMapper: DataMapperFn<T, D>,
        protected chartConfig: Config,
        protected drawConfig: DrawConfig,
    ) {
        super();

        this.margin = drawConfig.margin || { top: 0, bottom: 0, left: 0, right: 0 };
        this.svg = createSVG(drawConfig);
        this.ctx = this.svg.append("g")
            .attr("class", "chart-area")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        this.setData(rawData);

        if(chartConfig.title) {
            this.svg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", this.margin.left + this.drawConfig.width / 2)
                .attr("y", this.margin.top - 10)
                .html(chartConfig.title);
        }
    }

    public renderUnknown() {
        if(!this.chartConfig.hideUnknown && this.unknownPoints) {
            this.ctx.selectAll(".unknown-label").data([this.unknownPoints]).join("text")
                .attr("class", "unknown-label")
                .attr("font-size", "smaller")
                .attr("text-anchor", "end")
                .attr("x", this.drawConfig.width)
                .attr("y", -5)
                .text((d) => `Unknown: ${d}`);
        }
    }
}





interface XYChartConfig<D, X, Y> extends ChartConfig<D> {
    xAxisLabel: string;
    xTickFormat?: (d: X) => string;
    yAxisLabel: string;
    yTickFormat?: (d: Y) => string;
}

abstract class AbstractXYChart<
    T, D,
    XKey extends keyof D,
    YKey extends keyof D,
    Config extends XYChartConfig<D, D[XKey], D[YKey]>
> extends AbstractChart<T, D, Config> {
    protected abstract xAxis: d3.Axis<D[XKey]>;
    protected abstract yAxis: d3.Axis<D[YKey]>;

    protected renderAxes(xWrapWidth?: number) {
        this.svg.selectAll(".x-axis,.x-label,.y-axis,.y-label").remove();

        const xAxisSel = this.ctx.append("g")
            .attr("class", "x-axis")
            .call(this.xAxis)
                .attr("transform", `translate(0, ${this.drawConfig.height})`);
        if(xWrapWidth !== undefined) {
            xAxisSel.selectAll(".tick text")
                .call(wrapAxisText, xWrapWidth);
        }
        this.svg.append("text")
            .attr("class", "x-label")
            .attr("text-anchor", "middle")
            .attr("x", this.margin.left + this.drawConfig.width / 2)
            .attr("y", this.margin.top + this.drawConfig.height + this.margin.bottom - 6)
            .text(this.chartConfig.xAxisLabel);
        this.ctx.append("g")
            .attr("class", "y-axis")
            .call(this.yAxis);
        this.svg.append("text")
            .attr("class", "y-label")
            .attr("text-anchor", "middle")
            .attr("x", 0 - this.margin.top - this.drawConfig.height / 2)
            .attr("y", 50)
            .attr("transform", "rotate(-90)")
            .text(this.chartConfig.yAxisLabel);
    }
}




