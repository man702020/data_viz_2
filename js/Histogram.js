"use strict";
class HistogramChart extends AbstractChart {
    setData(sourceData) {
        super.setData(sourceData);
        const xDomain = getBinExtent(this.data);
        this.xScale = d3.scaleLinear()
            .domain(xDomain)
            .range([0, this.drawConfig.width]);
        this.yScale = d3.scaleLinear()
            .domain([0, d3.max(this.data, (b) => b.length)])
            .range([this.drawConfig.height, 0]);
        this.xAxis = d3.axisBottom(this.xScale);
        this.yAxis = d3.axisLeft(this.yScale);
        this.renderAxes();
    }
    constructor(rawData, dataMapper, histogramConfig, drawConfig) {
        super(rawData, dataMapper, histogramConfig, drawConfig);
        this.render();
    }
    renderAxes(xWrapWidth) {
        this.svg.selectAll(".x-axis,.x-label,.y-axis,.y-label").remove();
        const xAxisSel = this.ctx.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${this.drawConfig.height})`)
            .call(this.xAxis);
        if (xWrapWidth !== undefined) {
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
    render() {
        const barSel = this.ctx.selectAll(".bar").data(this.data).join("rect")
            .attr("class", "bar data-element")
            .attr("x", (d) => this.xScale(d.x0))
            .attr("y", (d) => this.yScale(d.length))
            .attr("width", (d) => this.xScale(d.x1) - this.xScale(d.x0))
            .attr("height", (d) => this.drawConfig.height - this.yScale(d.length))
            .attr("fill", (d) => this.chartConfig.color || "#000")
            .on("click", (ev, d) => {
            var _a, _b;
            ev.stopPropagation();
            (_b = (_a = this.chartConfig).onDataSelect) === null || _b === void 0 ? void 0 : _b.call(_a, d);
        });
        enableTooltip(barSel, this.chartConfig.tooltipFn || ((d) => `${d.length}`));
        this.renderUnknown();
    }
}
class DateHistogramChart extends AbstractChart {
    setData(sourceData) {
        super.setData(sourceData);
        const xDomain = getDateBinExtent(this.data);
        this.xScale = d3.scaleTime()
            .domain(xDomain)
            .range([0, this.drawConfig.width]);
        this.yScale = d3.scaleLinear()
            .domain([0, d3.max(this.data, (b) => b.length)])
            .range([this.drawConfig.height, 0]);
        this.xAxis = d3.axisBottom(this.xScale);
        this.yAxis = d3.axisLeft(this.yScale);
        this.renderAxes();
    }
    setDataMapper(sourceData, dataMapper) {
        this.dataMapper = dataMapper;
        this.setData(sourceData);
        this.render();
    }
    constructor(rawData, dataMapper, histogramConfig, drawConfig) {
        super(rawData, dataMapper, histogramConfig, drawConfig);
        this.brush = d3.brushX()
            .extent([[100, 50], [this.margin.left + this.drawConfig.width, this.margin.top + this.drawConfig.height + this.margin.bottom - 50]])
            .on("end", (e) => {
            if (e.selection) {
                this.onBrush(e.selection);
            }
            ;
        });
        this.brushG = this.svg.append('g')
            .attr('class', 'timeline-brush brush x-brush')
            .call(this.brush);
        this.render();
    }
    renderAxes(xWrapWidth) {
        this.svg.selectAll(".x-axis,.x-label,.y-axis,.y-label").remove();
        const xAxisSel = this.ctx.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${this.drawConfig.height})`)
            .call(this.xAxis);
        if (xWrapWidth !== undefined) {
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
    render() {
        const barSel = this.ctx.selectAll(".bar").data(this.data).join("rect")
            .attr("class", "bar data-element")
            .attr("x", (d) => this.xScale(d.x0))
            .attr("y", (d) => this.yScale(d.length))
            .attr("width", (d) => this.xScale(d.x1) - this.xScale(d.x0))
            .attr("height", (d) => this.drawConfig.height - this.yScale(d.length))
            .attr("fill", (d) => this.chartConfig.color || "#000")
            .on("click", (ev, d) => {
            var _a, _b;
            ev.stopPropagation();
            (_b = (_a = this.chartConfig).onDataSelect) === null || _b === void 0 ? void 0 : _b.call(_a, d);
        });
        enableTooltip(barSel, this.chartConfig.tooltipFn || ((d) => `${d.length}`));
        this.renderUnknown();
    }
    onBrush(selection) {
        var _a, _b;
        const selectedDomain = selection.map((d) => d3.timeMonth.offset(this.xScale.invert(d), -1));
        //console.log(selectedDomainUncorrect);
        // Filter the data based on the brush selection
        const binsInSelection = this.data.filter((bin) => {
            var _a, _b;
            const binStart = (_a = bin.x0) === null || _a === void 0 ? void 0 : _a.getTime();
            const binEnd = (_b = bin.x1) === null || _b === void 0 ? void 0 : _b.getTime();
            return binStart && binEnd &&
                ((binStart >= selectedDomain[0].getTime() && binStart < selectedDomain[1].getTime())
                    || (binEnd > selectedDomain[0].getTime() && binEnd <= selectedDomain[1].getTime()));
        });
        // Update the scales with the filtered data
        const xDomain = getDateBinExtent(binsInSelection);
        (_b = (_a = this.chartConfig).onRegionSelect) === null || _b === void 0 ? void 0 : _b.call(_a, xDomain);
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
    }
    ;
}
function getBinExtent(data) {
    const start = data.pop();
    let min = start.x0;
    let max = start.x1;
    for (const { x0, x1 } of data) {
        if (x0 && x0 < min) {
            min = x0;
        }
        if (x1 && x1 > max) {
            max = x1;
        }
    }
    return [min, max];
}
function getDateBinExtent(data) {
    var _a, _b;
    const start = data.pop();
    let min = (_a = start.x0) === null || _a === void 0 ? void 0 : _a.getTime();
    let max = (_b = start.x1) === null || _b === void 0 ? void 0 : _b.getTime();
    for (const { x0, x1 } of data) {
        if (x0 && x0.getTime() < min) {
            min = x0.getTime();
        }
        if (x1 && x1.getTime() > max) {
            max = x1.getTime();
        }
    }
    return [new Date(min), new Date(max)];
}
//# sourceMappingURL=Histogram.js.map