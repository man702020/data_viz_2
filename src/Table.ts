


interface TableHeaderInfo<T> {
    key: keyof T,
    title: string
}
interface TableConfig<T> {
    onHover(data: T): void;
}

class Table<T extends Record<string, any>>
{
    private table: d3.Selection<HTMLTableElement, unknown, HTMLElement, any>;
    private thead: d3.Selection<HTMLTableRowElement, unknown, HTMLElement, any>;
    private tbody: d3.Selection<HTMLTableSectionElement, unknown, HTMLElement, any>;

    public constructor(
        private headers: TableHeaderInfo<T>[],
        private data: T[],
        private parent: string,
        private config?: TableConfig<T>
    ) {
        this.table = d3.select(this.parent)
            .append("div")
                .attr("class", "table-responsive vh-100")
            .append("table")
                .attr("class", "table table-sm table-hover");

        this.thead = this.table.append("thead").append("tr");
        this.tbody = this.table.append("tbody");

        this.render();
    }

    public render() {
        this.thead.selectAll(".table-header").data(this.headers).join("th")
            .attr("scope", "col")
            .text((d) => d.title);

        const rowSelector = this.tbody.selectAll(".table-row").data(this.data).join("tr");
        for(const { key } of this.headers) {
            rowSelector.append("td").text((d) => d[key]);
        }
        rowSelector.on("mouseover", (event, d) => {
            this.config?.onHover(d);
        });
    }
}
