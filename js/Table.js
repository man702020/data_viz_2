"use strict";
class Table {
    constructor(headers, data, parent, config) {
        this.headers = headers;
        this.data = data;
        this.parent = parent;
        this.config = config;
        this.table = d3.select(this.parent)
            .append("div")
            .attr("class", "table-responsive vh-100")
            .append("table")
            .attr("class", "table table-sm table-hover");
        this.thead = this.table.append("thead").append("tr");
        this.tbody = this.table.append("tbody");
        this.render();
    }
    render() {
        this.thead.selectAll(".table-header").data(this.headers).join("th")
            .attr("scope", "col")
            .text((d) => d.title);
        const rowSelector = this.tbody.selectAll(".table-row").data(this.data).join("tr");
        for (const { key } of this.headers) {
            rowSelector.append("td").text((d) => d[key]);
        }
        rowSelector.on("mouseover", (event, d) => {
            var _a;
            (_a = this.config) === null || _a === void 0 ? void 0 : _a.onHover(d);
        });
    }
}
//# sourceMappingURL=Table.js.map