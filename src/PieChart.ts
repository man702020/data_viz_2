


interface PieConfig extends ChartConfig<PieData> {
    colorScheme?: readonly string[];
    legend?: boolean;
}
interface PieData {
    value: number;
    label: string;
    color?: string;
}

class PieChart<T> extends AbstractChart<T, PieData, PieConfig>
{
    protected legend?: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

    protected total!: number;
    protected thetaScale!: d3.ScaleContinuousNumeric<number, number, never>;
    protected cScale?: d3.ScaleOrdinal<string, string>;

    protected cx: number;
    protected cy: number;
    protected radius: number;

    private sliceArcCounter = 0;



    public setData(sourceData: T[]) {
        super.setData(sourceData);

        this.total = this.data.reduce((acc, val) => acc + val.value, 0);
        this.thetaScale = d3.scaleLinear([0, this.total], [0, 2 * Math.PI]);

        if(this.chartConfig.colorScheme) {
            const cDomain = this.data.map((d) => d.label).filter((d) => d) as string[];
            this.cScale = d3.scaleOrdinal(cDomain, this.chartConfig.colorScheme);
        }
    }

    public constructor(
        rawData: T[],
        dataMapper: DataMapperFn<T, PieData>,
        pieConfig: PieConfig,
        drawConfig: DrawConfig,
    ) {
        super(rawData, dataMapper, pieConfig, drawConfig);

        this.cx = this.drawConfig.width / 2;
        this.cy = this.drawConfig.height / 2;
        this.radius = Math.min(this.cx, this.cy);

        if(this.chartConfig.legend) {
            this.legend = this.ctx.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${this.cx + this.radius + 10}, 10)`);
        }

        this.render();
    }

    public renderLegend() {
        if(!this.legend) { return; }
        this.legend.selectAll(".legend-entry").remove();
        const entries = this.legend.selectAll(".legend-entry").data(this.data).join("g")
            .attr("class", "legend-entry")
            .attr("transform", (d) => `translate(5, ${this.data.indexOf(d) * 20})`);

        entries.append("rect")
            .attr("fill", (d) => d.color || this.cScale?.(d.label) || "#000")
            .attr("class", "data-element")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", 15)
            .attr("width", 20);
        entries.append("text")
            .attr("x", 25)
            .attr("y", 12)
            .attr("font-size", 10)
            .text((d) => `${d.label}: ${d.value}`)
    }

    public render() {
        this.sliceArcCounter = 0;
        let sliceSel: d3.Selection<any, any, any, any>;
        if(this.data.length === 1) {
            this.ctx.selectAll(".pie-slice").remove();
            sliceSel = this.ctx.selectAll(".pie-slice").data(this.data).join("circle")
                .attr("class", "pie-slice data-element")
                .attr("cx", this.cx)
                .attr("cy", this.cy)
                .attr("r", this.radius)
                .attr("fill", (d) => d.color || this.cScale?.(d.label) || "#000")
                .on("click", (ev: MouseEvent, d) => {
                    ev.stopPropagation();
                    this.chartConfig.onDataSelect?.(d);
                });
        } else {
            sliceSel = this.ctx.selectAll(".pie-slice").data(this.data).join("path")
                .attr("class", "pie-slice data-element")
                .attr("d", (d) => this.slice2path(d, this.sliceArcCounter))
                .attr("fill", (d) => d.color || this.cScale?.(d.label) || "#000")
                .on("click", (ev: MouseEvent, d) => {
                    ev.stopPropagation();
                    this.chartConfig.onDataSelect?.(d);
                });
        }
        enableTooltip(sliceSel, (d) => `${d.label}: ${d.value}`);

        if(this.chartConfig.legend) { this.renderLegend(); }
        this.renderUnknown();
    }

    protected slice2path(d: PieData, theta: number = 0) {
        const arcSweep = this.thetaScale(d.value);
        this.sliceArcCounter += arcSweep;
        const a1x = this.cx + this.radius * Math.cos(theta);
        const a1y = this.cy + this.radius * Math.sin(theta);
        const a2x = this.cx + this.radius * Math.cos(theta + arcSweep);
        const a2y = this.cy + this.radius * Math.sin(theta + arcSweep);
        return `M ${this.cx},${this.cy} L ${a1x},${a1y} A ${this.radius},${this.radius} 0 ${arcSweep > Math.PI ? 1 : 0} 1 ${a2x},${a2y} Z`;
    }
}
