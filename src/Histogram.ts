


interface HistogramConfig<X extends number | Date> extends XYChartConfig<d3.Bin<X, X>, X, number> {
    color?: string;
    bins?: number;
    tooltipFn?: (d: d3.Bin<X, X>) => string;
    onRegionSelect?: (region: [X, X]) => void;
}



class HistogramChart<T> extends AbstractChart<T, d3.Bin<number, number>, HistogramConfig<number>>
{
    protected xScale!: d3.ScaleLinear<number, number, never>;
    protected yScale!: d3.ScaleLinear<number, number, never>;
    protected xAxis!: d3.Axis<number>;
    protected yAxis!: d3.Axis<number>;




    public setData(sourceData: T[]) {
        super.setData(sourceData);

        const xDomain = getBinExtent(this.data);

        this.xScale = d3.scaleLinear()
            .domain(xDomain)
            .range([0, this.drawConfig.width]);
        this.yScale = d3.scaleLinear()
            .domain([0, d3.max(this.data, (b) => b.length)!])
            .range([this.drawConfig.height, 0]);

        this.xAxis = d3.axisBottom<number>(this.xScale);
        this.yAxis = d3.axisLeft<number>(this.yScale);

        this.renderAxes();
    }

    public constructor(
        rawData: T[],
        dataMapper: DataMapperFn<T, d3.Bin<number, number>>,
        histogramConfig: HistogramConfig<number>,
        drawConfig: DrawConfig,
    ) {
        super(rawData, dataMapper, histogramConfig, drawConfig);

        this.render();
    }

    protected renderAxes(xWrapWidth?: number) {
        this.svg.selectAll(".x-axis,.x-label,.y-axis,.y-label").remove();

        const xAxisSel = this.ctx.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${this.drawConfig.height})`)
            .call(this.xAxis);
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

    public render() {
        const barSel = this.ctx.selectAll(".bar").data(this.data).join("rect")
            .attr("class", "bar data-element")
            .attr("x", (d) => this.xScale(d.x0!)!)
            .attr("y", (d) => this.yScale(d.length))
            .attr("width", (d) => this.xScale(d.x1!) - this.xScale(d.x0!)!)
            .attr("height", (d) => this.drawConfig.height - this.yScale(d.length))
            .attr("fill", (d) => this.chartConfig.color || "#000")
            .on("click", (ev: MouseEvent, d) => {
                ev.stopPropagation();
                this.chartConfig.onDataSelect?.(d);
            });
        enableTooltip(barSel, this.chartConfig.tooltipFn || ((d) => `${d.length}`));
        this.renderUnknown();
    }
}

class DateHistogramChart<T> extends AbstractChart<T, d3.Bin<Date, Date>, HistogramConfig<Date>>
{
    protected xScale!: d3.ScaleTime<number, number, never>;
    protected yScale!: d3.ScaleLinear<number, number, never>;
    protected xAxis!: d3.Axis<Date | number>;
    protected yAxis!: d3.Axis<number>;

    protected brush: d3.BrushBehavior<unknown>;
    protected brushG: d3.Selection<SVGGElement, unknown, HTMLElement, any>;



    public setData(sourceData: T[]) {
        super.setData(sourceData);

        const xDomain = getDateBinExtent(this.data);

        this.xScale = d3.scaleTime()
            .domain(xDomain)
            .range([0, this.drawConfig.width]);
        this.yScale = d3.scaleLinear()
            .domain([0, d3.max(this.data, (b) => b.length)!])
            .range([this.drawConfig.height, 0]);

        this.xAxis = d3.axisBottom<Date | number>(this.xScale);
        this.yAxis = d3.axisLeft<number>(this.yScale);

        this.renderAxes();
    }
    public setDataMapper(sourceData: T[], dataMapper: DataMapperFn<T, d3.Bin<Date, Date>>) {
        this.dataMapper = dataMapper;
        this.setData(sourceData);
        this.render();
    }

    public constructor(
        rawData: T[],
        dataMapper: DataMapperFn<T, d3.Bin<Date, Date>>,
        histogramConfig: HistogramConfig<Date>,
        drawConfig: DrawConfig,
    ) {
        super(rawData, dataMapper, histogramConfig, drawConfig);

        this.brush = d3.brushX()
            .extent([[100, 50], [this.margin.left + this.drawConfig.width,  this.margin.top + this.drawConfig.height + this.margin.bottom -50]])
            .on("end", (e: d3.D3BrushEvent<unknown>) => {
                if (e.selection) { this.onBrush(e.selection as [number, number]) };
            });

        this.brushG = this.svg.append('g')
            .attr('class', 'timeline-brush brush x-brush')
            .call(this.brush);

        this.render();
    }

    protected renderAxes(xWrapWidth?: number) {
        this.svg.selectAll(".x-axis,.x-label,.y-axis,.y-label").remove();

        const xAxisSel = this.ctx.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${this.drawConfig.height})`)
            .call(this.xAxis);
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

    public render() {
        const barSel = this.ctx.selectAll(".bar").data(this.data).join("rect")
            .attr("class", "bar data-element")
            .attr("x", (d) => this.xScale(d.x0!)!)
            .attr("y", (d) => this.yScale(d.length))
            .attr("width", (d) => this.xScale(d.x1!) - this.xScale(d.x0!)!)
            .attr("height", (d) => this.drawConfig.height - this.yScale(d.length))
            .attr("fill", (d) => this.chartConfig.color || "#000")
            .on("click", (ev: MouseEvent, d) => {
                ev.stopPropagation();
                this.chartConfig.onDataSelect?.(d);
            });
        enableTooltip(barSel, this.chartConfig.tooltipFn || ((d) => `${d.length}`));
        this.renderUnknown();
    }

    private onBrush(selection: [number, number]) {
        const selectedDomain = selection.map((d) => d3.timeMonth.offset(this.xScale.invert(d), -1)) as [Date, Date];

        //console.log(selectedDomainUncorrect);
        // Filter the data based on the brush selection
        const binsInSelection = this.data.filter((bin) => {
            const binStart = bin.x0?.getTime();
            const binEnd = bin.x1?.getTime();

            return binStart && binEnd &&
                ((binStart >= selectedDomain[0].getTime() && binStart < selectedDomain[1].getTime())
                || (binEnd > selectedDomain[0].getTime() && binEnd <= selectedDomain[1].getTime()));
        });


        // Update the scales with the filtered data
        const xDomain = getDateBinExtent(binsInSelection);
        this.chartConfig.onRegionSelect?.(xDomain);
        /*
        this.xScale.domain(xDomain);
        this.yScale.domain([0, d3.max(binsInSelection, (d) => d.length)!]);

        this.ctx.select<SVGGElement>(".x-axis")
            .transition()
            .duration(500)
            .call(this.xAxis);
        this.ctx.select<SVGGElement>(".y-axis")
            .transition()
            .duration(500)
            .call(this.yAxis);



        // Update the bars with the filtered data
        const barSel = this.ctx.selectAll(".bar").data(binsInSelection);
        barSel.exit().remove();
        barSel.enter().append("rect")
            .attr("class", "bar data-element")
            .attr("fill", (d) => this.chartConfig.color || "#000")
            .merge(barSel)
            .attr("x", (d) => this.xScale(d.x0))
            .attr("y", (d) => this.yScale(d.length))
            .attr("width", (d) => this.xScale(d.x1) - this.xScale(d.x0))
            .attr("height", (d) => this.drawConfig.height - this.yScale(d.length))
            ;

        // Update the axes with the filtered data
        const xAxisSel = this.ctx.select(".x-axis");
        xAxisSel.call(this.xAxis);
        */

        //this.brushG.select(".brush-timeline").call(this.brush.move, null);
        // removes the brush directly this.brushG.remove();
        this.brushG.call(this.brush.move, null);
    };
}

function getBinExtent(data: d3.Bin<number, number>[]) {
    const start = data.pop()!;
    let min = start.x0 as number;
    let max = start.x1 as number;
    for(const { x0, x1 } of data) {
        if(x0 && x0 < min) { min = x0; }
        if(x1 && x1 > max) { max = x1; }
    }
    return [min, max];
}
function getDateBinExtent(data: d3.Bin<Date, Date>[]): [Date, Date] {
    const start = data.pop()!;
    let min = start.x0?.getTime() as number;
    let max = start.x1?.getTime() as number;
    for(const { x0, x1 } of data) {
        if(x0 && x0.getTime() < min) { min = x0.getTime(); }
        if(x1 && x1.getTime() > max) { max = x1.getTime(); }
    }
    return [new Date(min), new Date(max)];
}
