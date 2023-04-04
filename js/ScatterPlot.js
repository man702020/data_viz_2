"use strict";
class ScatterPlot extends AbstractXYChart {
    constructor(rawData, dataMapper, scatterConfig, drawConfig) {
        super(rawData, dataMapper, scatterConfig, drawConfig);
        const xDomain = d3.extent(this.data, ({ x }) => x);
        const yDomain = d3.extent(this.data, ({ y }) => y);
        this.xScale = this.chartConfig.xScale === "log" ?
            d3.scaleLog(xDomain, [0, drawConfig.width]) :
            d3.scaleLinear(xDomain, [0, drawConfig.width]);
        this.yScale = this.chartConfig.xScale === "log" ?
            d3.scaleLog(yDomain, [drawConfig.height, 0]) :
            d3.scaleLinear(yDomain, [drawConfig.height, 0]);
        this.xAxis = d3.axisBottom(this.xScale);
        this.yAxis = d3.axisLeft(this.yScale);
        this.renderAxes();
        this.render();
    }
    render() {
        const pointSel = this.ctx.selectAll(".scatter-point")
            .data(this.data).join("circle")
            .attr("class", (d) => `scatter-point data-element ${d.className}`)
            .attr("cx", (d) => this.xScale(d.x))
            .attr("cy", (d) => this.yScale(d.y))
            .attr("r", (d) => d.r || 2)
            .attr("fill", (d) => d.color || "#000");
        enableTooltip(pointSel, (d) => d.tooltip);
        this.renderUnknown();
    }
}
//# sourceMappingURL=ScatterPlot.js.map