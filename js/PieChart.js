"use strict";
class PieChart extends AbstractChart {
    setData(sourceData) {
        super.setData(sourceData);
        this.total = this.data.reduce((acc, val) => acc + val.value, 0);
        this.thetaScale = d3.scaleLinear([0, this.total], [0, 2 * Math.PI]);
        if (this.chartConfig.colorScheme) {
            const cDomain = this.data.map((d) => d.label).filter((d) => d);
            this.cScale = d3.scaleOrdinal(cDomain, this.chartConfig.colorScheme);
        }
    }
    constructor(rawData, dataMapper, pieConfig, drawConfig) {
        super(rawData, dataMapper, pieConfig, drawConfig);
        this.sliceArcCounter = 0;
        this.cx = this.drawConfig.width / 2;
        this.cy = this.drawConfig.height / 2;
        this.radius = Math.min(this.cx, this.cy);
        if (this.chartConfig.legend) {
            this.legend = this.ctx.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${this.cx + this.radius + 10}, 10)`);
        }
        this.render();
    }
    renderLegend() {
        if (!this.legend) {
            return;
        }
        this.legend.selectAll(".legend-entry").remove();
        const entries = this.legend.selectAll(".legend-entry").data(this.data).join("g")
            .attr("class", "legend-entry")
            .attr("transform", (d) => `translate(5, ${this.data.indexOf(d) * 20})`);
        entries.append("rect")
            .attr("fill", (d) => { var _a; return d.color || ((_a = this.cScale) === null || _a === void 0 ? void 0 : _a.call(this, d.label)) || "#000"; })
            .attr("class", "data-element")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", 15)
            .attr("width", 20);
        entries.append("text")
            .attr("x", 25)
            .attr("y", 12)
            .attr("font-size", 10)
            .text((d) => `${d.label}: ${d.value}`);
    }
    render() {
        this.sliceArcCounter = 0;
        let sliceSel;
        if (this.data.length === 1) {
            this.ctx.selectAll(".pie-slice").remove();
            sliceSel = this.ctx.selectAll(".pie-slice").data(this.data).join("circle")
                .attr("class", "pie-slice data-element")
                .attr("cx", this.cx)
                .attr("cy", this.cy)
                .attr("r", this.radius)
                .attr("fill", (d) => { var _a; return d.color || ((_a = this.cScale) === null || _a === void 0 ? void 0 : _a.call(this, d.label)) || "#000"; })
                .on("click", (ev, d) => {
                var _a, _b;
                ev.stopPropagation();
                (_b = (_a = this.chartConfig).onDataSelect) === null || _b === void 0 ? void 0 : _b.call(_a, d);
            });
        }
        else {
            sliceSel = this.ctx.selectAll(".pie-slice").data(this.data).join("path")
                .attr("class", "pie-slice data-element")
                .attr("d", (d) => this.slice2path(d, this.sliceArcCounter))
                .attr("fill", (d) => { var _a; return d.color || ((_a = this.cScale) === null || _a === void 0 ? void 0 : _a.call(this, d.label)) || "#000"; })
                .on("click", (ev, d) => {
                var _a, _b;
                ev.stopPropagation();
                (_b = (_a = this.chartConfig).onDataSelect) === null || _b === void 0 ? void 0 : _b.call(_a, d);
            });
        }
        enableTooltip(sliceSel, (d) => `${d.label}: ${d.value}`);
        if (this.chartConfig.legend) {
            this.renderLegend();
        }
        this.renderUnknown();
    }
    slice2path(d, theta = 0) {
        const arcSweep = this.thetaScale(d.value);
        this.sliceArcCounter += arcSweep;
        const a1x = this.cx + this.radius * Math.cos(theta);
        const a1y = this.cy + this.radius * Math.sin(theta);
        const a2x = this.cx + this.radius * Math.cos(theta + arcSweep);
        const a2y = this.cy + this.radius * Math.sin(theta + arcSweep);
        return `M ${this.cx},${this.cy} L ${a1x},${a1y} A ${this.radius},${this.radius} 0 ${arcSweep > Math.PI ? 1 : 0} 1 ${a2x},${a2y} Z`;
    }
}
//# sourceMappingURL=PieChart.js.map