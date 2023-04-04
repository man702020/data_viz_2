"use strict";
class BarChart extends AbstractXYChart {
    setData(sourceData) {
        super.setData(sourceData);
        const sortFn = this.chartConfig.sort ||
            (this.chartConfig.labelSort ? (a, b) => this.chartConfig.labelSort(a.label, b.label) :
                (this.chartConfig.labelOrder ? ((a, b) => this.chartConfig.labelOrder.indexOf(a.label) - this.chartConfig.labelOrder.indexOf(b.label)) :
                    (a, b) => a.label.localeCompare(b.label)));
        this.data.sort(sortFn);
        const xDomain = this.data.map(({ label }) => label);
        const yDomain = [0, d3.max(this.data, ({ value }) => value)];
        this.xScale = d3.scaleBand()
            .domain(xDomain)
            .range([0, this.drawConfig.width])
            .padding(0.4);
        this.yScale = d3.scaleLinear()
            .domain(yDomain)
            .range([this.drawConfig.height, 0]);
        if (this.chartConfig.colorScheme) {
            this.cScale = d3.scaleOrdinal(xDomain, this.chartConfig.colorScheme);
        }
        this.xAxis = d3.axisBottom(this.xScale);
        this.yAxis = d3.axisLeft(this.yScale);
        this.renderAxes(this.xScale.bandwidth());
    }
    constructor(rawData, dataMapper, barConfig, drawConfig) {
        super(rawData, dataMapper, barConfig, drawConfig);
        this.render();
    }
    render() {
        const barSel = this.ctx.selectAll(".bar").data(this.data).join("rect")
            .attr("class", "bar data-element")
            .attr("x", (d) => this.xScale(d.label))
            .attr("y", (d) => this.yScale(d.value))
            .attr("width", this.xScale.bandwidth())
            .attr("height", (d) => this.drawConfig.height - this.yScale(d.value))
            .attr("fill", (d) => { var _a; return d.color || ((_a = this.cScale) === null || _a === void 0 ? void 0 : _a.call(this, d.label)) || "#000"; })
            .on("click", (ev, d) => {
            var _a, _b;
            ev.stopPropagation();
            (_b = (_a = this.chartConfig).onDataSelect) === null || _b === void 0 ? void 0 : _b.call(_a, d);
        });
        enableTooltip(barSel, (d) => d.tooltip);
    }
}
class HorizontalBarChart extends AbstractXYChart {
    setData(sourceData) {
        super.setData(sourceData);
        const sortFn = this.chartConfig.sort ||
            (this.chartConfig.labelSort ? (a, b) => this.chartConfig.labelSort(a.label, b.label) :
                (this.chartConfig.labelOrder ? ((a, b) => this.chartConfig.labelOrder.indexOf(a.label) - this.chartConfig.labelOrder.indexOf(b.label)) :
                    (a, b) => a.label.localeCompare(b.label)));
        this.data.sort(sortFn);
    }
    constructor(rawData, dataMapper, barConfig, drawConfig) {
        super(rawData, dataMapper, barConfig, drawConfig);
        const xDomain = [0, d3.max(this.data, ({ value }) => value)];
        const yDomain = this.data.map(({ label }) => label);
        this.xScale = d3.scaleLinear()
            .domain(xDomain)
            .range([0, drawConfig.width]);
        this.yScale = d3.scaleBand()
            .domain(yDomain)
            .range([0, drawConfig.height])
            .padding(0.4);
        if (this.chartConfig.colorScheme) {
            this.cScale = d3.scaleOrdinal(yDomain, this.chartConfig.colorScheme);
        }
        this.xAxis = d3.axisBottom(this.xScale);
        this.yAxis = d3.axisLeft(this.yScale);
        this.renderAxes();
        this.render();
    }
    render() {
        const barSel = this.ctx.selectAll(".bar").data(this.data).join("rect")
            .attr("class", "bar data-element")
            .attr("y", (d) => this.yScale(d.label))
            .attr("x", 0)
            .attr("height", this.yScale.bandwidth())
            .attr("width", (d) => this.xScale(d.value))
            .attr("fill", (d) => { var _a; return d.color || ((_a = this.cScale) === null || _a === void 0 ? void 0 : _a.call(this, d.label)) || "#000"; })
            .on("click", (ev, d) => {
            var _a, _b;
            ev.stopPropagation();
            (_b = (_a = this.chartConfig).onDataSelect) === null || _b === void 0 ? void 0 : _b.call(_a, d);
        });
        enableTooltip(barSel, (d) => d.tooltip);
        this.renderUnknown();
    }
}
//# sourceMappingURL=BarChart.js.map