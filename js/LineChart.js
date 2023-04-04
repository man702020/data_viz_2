"use strict";
class LineChart extends AbstractXYChart {
    setData(sourceData) {
        super.setData(sourceData);
        const xDomain = d3.extent(this.data, ({ x }) => x);
        const yDomain = d3.extent(this.data, ({ y }) => y);
        this.xScale = this.chartConfig.xScale === "log" ?
            d3.scaleLog(xDomain, [0, this.drawConfig.width]) :
            d3.scaleLinear(xDomain, [0, this.drawConfig.width]);
        this.yScale = this.chartConfig.xScale === "log" ?
            d3.scaleLog(yDomain, [this.drawConfig.height, 0]) :
            d3.scaleLinear(yDomain, [this.drawConfig.height, 0]);
        this.xAxis = d3.axisBottom(this.xScale);
        if (this.chartConfig.xTickFormat) {
            this.xAxis.tickFormat(this.chartConfig.xTickFormat);
        }
        this.yAxis = d3.axisLeft(this.yScale);
        if (this.chartConfig.yTickFormat) {
            this.yAxis.tickFormat(this.chartConfig.yTickFormat);
        }
        this.renderAxes();
    }
    constructor(rawData, dataMapper, lineConfig, drawConfig) {
        super(rawData, dataMapper, lineConfig, drawConfig);
        this.ctx.append("polyline")
            .attr("class", "line-plot-line");
        this.render();
    }
    render() {
        this.ctx.select(".line-plot-line")
            .attr("points", this.data.map(({ x, y }) => `${this.xScale(x)},${this.yScale(y)}`).join(" "))
            .attr("stroke", "#000")
            .attr("fill", "none");
    }
}
//# sourceMappingURL=LineChart.js.map