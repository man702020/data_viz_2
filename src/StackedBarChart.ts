


interface StackedBarData {
    xValue: string;
    yValue: number;
    zValue: number;
    aValue: number;
}

class StackedBarChart {
    protected svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    protected ctx: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

    protected margin: Margin;

    protected xScale!: d3.ScaleBand<string>;
    protected yScale!: d3.ScaleLinear<number, number, never>;
    protected xAxis!: d3.Axis<string>;
    protected yAxis!: d3.Axis<number>;
    protected xAxisG: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    protected yAxisG: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

    protected cScale: d3.ScaleOrdinal<string, string>;

    protected stack: d3.Stack<unknown, StackedBarData, "yValue" | "zValue" | "aValue">;
    protected stackData!: d3.Series<StackedBarData, "yValue" | "zValue" | "aValue">[];



    constructor(
        public data: StackedBarData[],
        protected drawConfig: DrawConfig,
    ) {
        this.margin = drawConfig.margin || { top: 0, bottom: 0, left: 0, right: 0 };

        this.xScale = d3.scaleBand()
            .range([0, this.drawConfig.width])
            .paddingInner(0.2)
            .paddingOuter(0.2);

        this.yScale = d3.scaleLinear()
            .range([this.drawConfig.height, 0]);

        // Initialize axes
        this.xAxis = d3.axisBottom(this.xScale);
        this.yAxis = d3.axisLeft<number>(this.yScale).ticks(6);

        // Define size of SVG drawing area
        this.svg = createSVG(drawConfig);

        // Append group element that will contain our actual chart
        this.ctx = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

        // Append empty x-axis group and move it to the bottom of the chart
        this.xAxisG = this.ctx.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${this.drawConfig.height})`);

        // Append y-axis group
        this.yAxisG = this.ctx.append('g')
            .attr('class', 'axis y-axis');

        // Initialize stack generator and specify the categories or layers
        // that we want to show in the chart
        this.stack = d3.stack<unknown, StackedBarData, "yValue" | "zValue" | "aValue">()
            .keys(['yValue', 'zValue', 'aValue']);


        this.cScale = d3.scaleOrdinal<string>()
            .domain(['yValue', 'zValue', 'aValue'])
            .range(["#FF0000", "#00FF00", "#0000FF"]);

        this.svg.selectAll("legdots")
            .data(['yValue', 'zValue', 'aValue'])
            .enter()
            .append("circle")
            .attr("cx", (d, i) => { return this.margin.left + 30 + i * 80 })
            .attr("cy", this.margin.top + this.drawConfig.height + 30)
            .attr("r", 5)
            .style("fill", (d) => this.cScale(d))

        // Add x-axis label
        this.ctx.append('text')
            .attr('class', 'axis-label')
            .attr('x', this.drawConfig.width / 2)
            .attr('y', this.drawConfig.height + 55)
            .style('text-anchor', 'middle')
            .text('Months');

        // Add y-axis label
        this.ctx.append('text')
            .attr('class', 'axis-label')
            .attr('x', -this.drawConfig.height / 2)
            .attr('y', -40)
            .style('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .text('Number of Calls');


        this.svg.selectAll("leglabels")
            .data(['yValue', 'zValue', 'aValue'])
            .enter()
            .append("text")
            .attr("x", (d, i) => this.margin.left + i * 80 + 40)
            .attr("y", this.margin.top + this.drawConfig.height + 30) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", (d) => this.cScale(d))
            .text(function (d) {
                if (d == 'yValue') {
                    return 'Open'
                }
                else if (d == 'zValue') {
                    return 'Closed'
                }
                else {
                    return 'New'
                }
            })
            //.attr('font-family', 'sans-serif')
            .attr('font-size', 12)
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")

        this.updateVis();
    }


    updateVis() {
        this.xScale.domain(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"]);
        this.yScale.domain([0, 6000]);

        // Call stack generator on the dataset
        this.stackData = this.stack(this.data);

        this.renderVis();
    }

    renderVis() {
        console.log(this.stackData);

        //this.groups = this.svg.selectAll(".bars")
        //.data(this.stackData)
        //.join("g")
        //.attr("class", "bars")
        //.style("fill", d => this.color(d.key));

        const rect = this.ctx.selectAll('category')
            .data(this.stackData)
            .join('g')
            .attr('class', d => `category cat-${d.key}`)
            .attr('fill', d => this.cScale(d.key))
            .selectAll('rect')
            .data(d => d)
            .join('rect')
            .attr('x', d => this.xScale(d.data.xValue)!)
            .attr('y', d => this.yScale(d[1]))
            .attr('height', d => this.yScale(d[0]) - this.yScale(d[1]))
            .attr('width', this.xScale.bandwidth())
        /*
        .on('mouseover', (event,d) => {
            console.log("User on impact");
            d3.select('#tooltiptest')
            .style('display', 'block')
            .style('left', (event.pageX + this.config.tooltipPadding) + 'px')
            .style('top', (event.pageY + this.config.tooltipPadding) + 'px')
            .html(`
              <div class="tooltiptest-title">Month: ${d.data.xValue}</div>
              <ul>
                <li>Open: ${d.data.yValue}</li>
                <li>Closed: ${d.data.zValue}</li>
                <li>New: ${d.data.aValue}</li>;
                <li>Total:${d.data.yValue+d.data.zValue+d.data.aValue}</li>
              </ul>
            `);
          })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        });
        */

        // enableTooltip(rect, (d) => d.tooltip);

        // Update the axes
        this.xAxisG.call(this.xAxis);
        this.yAxisG.call(this.yAxis);
    }
}
