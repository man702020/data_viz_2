"use strict";
class AbstractVisualization {
    constructor() {
        this.data = [];
        this.unknownPoints = 0;
    }
    setData(sourceData) {
        if (sourceData.length === 0) {
            this.data = [];
            this.unknownPoints = 0;
        }
        else {
            const chartData = this.dataMapper(sourceData);
            this.data = chartData.data;
            this.unknownPoints = chartData.unknownCount;
        }
    }
}
class AbstractChart extends AbstractVisualization {
    constructor(rawData, dataMapper, chartConfig, drawConfig) {
        super();
        this.dataMapper = dataMapper;
        this.chartConfig = chartConfig;
        this.drawConfig = drawConfig;
        this.margin = drawConfig.margin || { top: 0, bottom: 0, left: 0, right: 0 };
        this.svg = createSVG(drawConfig);
        this.ctx = this.svg.append("g")
            .attr("class", "chart-area")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
        this.setData(rawData);
        if (chartConfig.title) {
            this.svg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", this.margin.left + this.drawConfig.width / 2)
                .attr("y", this.margin.top - 10)
                .html(chartConfig.title);
        }
    }
    renderUnknown() {
        if (!this.chartConfig.hideUnknown && this.unknownPoints) {
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
class AbstractXYChart extends AbstractChart {
    renderAxes(xWrapWidth) {
        this.svg.selectAll(".x-axis,.x-label,.y-axis,.y-label").remove();
        const xAxisSel = this.ctx.append("g")
            .attr("class", "x-axis")
            .call(this.xAxis)
            .attr("transform", `translate(0, ${this.drawConfig.height})`);
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
}
//# sourceMappingURL=AbstractChart.js.map