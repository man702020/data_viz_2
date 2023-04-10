"use strict";
function parseRecord(row) {
    return {
        SERVICE_REQUEST_ID: row.SERVICE_REQUEST_ID,
        STATUS: row.STATUS,
        SERVICE_NAME: row.SERVICE_NAME,
        SERVICE_CODE: row.SERVICE_CODE,
        DESCRIPTION: row.DESCRIPTION,
        AGENCY_RESPONSIBLE: row.AGENCY_RESPONSIBLE,
        REQUESTED_DATETIME: row.REQUESTED_DATETIME ? new Date(row.REQUESTED_DATETIME) : undefined,
        UPDATED_DATETIME: row.UPDATED_DATETIME ? new Date(row.UPDATED_DATETIME) : undefined,
        EXPECTED_DATETIME: row.EXPECTED_DATETIME ? new Date(row.EXPECTED_DATETIME) : undefined,
        ADDRESS: row.ADDRESS,
        ZIPCODE: row.ZIPCODE,
        LATITUDE: row.LATITUDE ? parseFloat(row.LATITUDE) : undefined,
        LONGITUDE: row.LONGITUDE ? parseFloat(row.LONGITUDE) : undefined,
        REQUESTED_DATE: row.REQUESTED_DATE ? new Date(row.REQUESTED_DATE) : undefined,
        UPDATED_DATE: row.UPDATED_DATE ? new Date(row.UPDATED_DATE) : undefined,
        LAST_TABLE_UPDATE: row.LAST_TABLE_UPDATE ? new Date(row.LAST_TABLE_UPDATE) : undefined,
    };
}
// d3.tsv('data/sampleData.tsv')
d3.tsv('data/Cincy311_2022_final.tsv')
    .then(rawData => {
    console.log(`Data loading complete: ${rawData.length} records.`);
    // const data = rawData.slice(0, 10000).map(parseRecord);
    const data = rawData.map(parseRecord)
        .filter((d, i) => { var _a; return i % 4 === 0 && ((_a = d.REQUESTED_DATE) === null || _a === void 0 ? void 0 : _a.getFullYear()) === 2022; });
    console.log(`Down to ${data.length} filtered records.`);
    console.log("Example:", data[0]);
    return visualizeData(data);
})
    .catch(err => {
    console.error("Error loading the data");
    console.error(err);
});
function visualizeData(data) {
    var _a;
    let currentData = data;
    const filters = {};
    const rerenderData = () => {
        const filterfns = Object.values(filters);
        const filteredData = filterfns.reduce((fData, fn) => fData.filter(fn), data);
        currentData = filteredData;
        for (const viz of visualizations) {
            viz.setData(currentData);
            viz.render();
        }
    };
    const addFilter = (key, filterFn) => {
        filters[key] = filterFn;
        rerenderData();
    };
    const removeFilter = (key) => {
        delete filters[key];
        rerenderData();
    };
    console.log("Building map...");
    const mappableData = data
        .filter((d) => d.LONGITUDE !== undefined && d.LATITUDE !== undefined)
        .map((d) => (Object.assign(Object.assign({}, d), { tooltip: `Description: ${d.DESCRIPTION}` })));
    const meanLat = d3.mean(mappableData, (d) => d.LATITUDE);
    const meanLng = d3.mean(mappableData, (d) => d.LONGITUDE);
    const visualizations = [];
    const filterData = (filteredData) => {
        currentData = filteredData;
        for (const viz of visualizations) {
            viz.setData(currentData);
            viz.render();
        }
    };
    // Initialize chart and then show it
    const leafletMap = new LeafletMap(data, elementMapper((d) => d.LATITUDE && d.LONGITUDE ? {
        latitude: d.LATITUDE,
        longitude: d.LONGITUDE,
        tooltip: `Description: ${d.DESCRIPTION}`
    } : undefined), {
        parentElement: "map-container",
        markerRadius: 5,
        focusRadius: 8,
        initialZoom: 11,
        initialCenter: [meanLat, meanLng],
        onRegionSelect(bounds) {
            if (!bounds) {
                removeFilter("map-brush");
            }
            else {
                addFilter("map-brush", (d) => d.LATITUDE && d.LONGITUDE &&
                    bounds.contains([d.LATITUDE, d.LONGITUDE]));
            }
        },
    });
    d3.select("#map-base-layer-switch-esri")
        .on("change", () => leafletMap.switchBaseLayer(FreeTileLayers.ESRI));
    d3.select("#map-base-layer-switch-topo")
        .on("change", () => leafletMap.switchBaseLayer(FreeTileLayers.TOPO));
    d3.select("#map-base-layer-switch-stamen-terrain")
        .on("change", () => leafletMap.switchBaseLayer(FreeTileLayers.StamenTerrain));
    visualizations.push(leafletMap);
    console.log("Map complete");
    console.log("Constructing Timeline...");
    const timelineHist = new DateHistogramChart(data, binDateDayMapper((d) => d.REQUESTED_DATE, {
        bins: "weeks",
        startOfWeek: 1,
        dayOfMonth: 1
    }), {
        xAxisLabel: "Date",
        yAxisLabel: "Calls",
        tooltipFn: (b) => b.x0 ? `${MONTH_NAMES[b.x0.getMonth()]} ${b.x0.getFullYear()}: ${b.length}` : `${b.length}`,
        onRegionSelect: (region) => {
            addFilter("timeline-brush", (d) => {
                var _a;
                const t = (_a = d.REQUESTED_DATE) === null || _a === void 0 ? void 0 : _a.getTime();
                return t && t >= region[0].getTime() && t <= region[1].getTime();
            });
        }
    }, {
        parent: "#timeline-container",
        className: "h-100",
        width: 1000,
        height: 150,
        margin: { top: 50, left: 100, bottom: 50, right: 50 }
    });
    visualizations.push(timelineHist);
    d3.select("#reset-button").on("click", () => removeFilter("timeline-brush"));
    d3.select("#month-button").on("click", () => {
        timelineHist.setDataMapper(currentData, binDateDayMapper((d) => d.REQUESTED_DATE, { bins: "days" }));
    });
    d3.select("#week-button").on("click", () => {
        timelineHist.setDataMapper(currentData, binDateDayMapper((d) => d.REQUESTED_DATE, { bins: "weeks" }));
    });
    console.log("Timeline complete.");
    // B Goal Charts
    // Day of Week popularity bar chart
    const categories = []; // list of grouped categories to prevent massive overfilling
    const dowBarChart = new BarChart(data, 
    // the mapper tells the chart what data from the source `data` you actually want to plot
    // `aggregateMapper` is a way to group the data points into bins for a bar chart
    aggregateMapper(//TODO: Need to sort by weekday as well. originally returns week day as number
    (d) => ((d.REQUESTED_DATE || new Date()).toLocaleString('en-us', { weekday: 'short' })), // or whatever you want to group it by
    (b, count) => ({ label: b, value: count,
        tooltip: "Calls: " + count.toString(),
        color: "#66aa77" })), {
        xAxisLabel: "Day",
        yAxisLabel: "Calls",
        labelOrder: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    }, {
        parent: "#dow-trend-container",
        className: "h-100",
        width: 300,
        height: 100,
        margin: { top: 50, left: 100, bottom: 50, right: 50 }
    });
    const myCategories = d3.rollups(data, (group) => group.length, // grab count of group
    (label) => label.SERVICE_NAME);
    // filter the wierd ones with (<=25)
    let all_categories;
    let categoryNames;
    all_categories = [];
    categoryNames = [];
    const countCutoff = 50;
    const subCategories = ["Building", "Tree", "Rats", "Weeds", "Trash", "Trash cart", "Sign", "Sewage", "Vehicle", "Tall grass/weeds", "Yard Waste", "Recycling"];
    myCategories.forEach(d => {
        let categoryData = { Category: d[0], Count: d[1] };
        const count = d[1];
        if (count > countCutoff) { // if greater than cutoff, check for subcategory
            let catName = (d[0] || "Unkown").replace('"', '');
            let firstWord = (catName.split(",")[0] || "Unkown");
            // If first word is a subcategory, add to specific category data instead of pushing new
            if (subCategories.includes(firstWord)) { // Compiles subcategories
                categoryData = { Category: firstWord, Count: d[1] };
                let index = all_categories.findIndex(d => d.Category == firstWord); // find index of existing obj
                // if index == -1 (not found) then add new category data, else: append count to existing category
                if (index == -1) {
                    all_categories.push(categoryData);
                }
                else {
                    all_categories[index].Count += d[1];
                }
            }
            else { // if not a subcategory, then just add to categories
                categoryData.Category = replaceAll(categoryData.Category, '"', '');
                all_categories.push(categoryData);
            }
        }
        else { // categorize as misc. appends to existing
            categoryData.Category = "Misc.";
            let index = all_categories.findIndex(d => d.Category == "Misc.");
            if (index == -1) {
                all_categories.push(categoryData);
            }
            else {
                all_categories[index].Count += d[1];
            }
        }
    });
    // Sort data from large to small
    all_categories.sort((a, b) => b.Count - a.Count); // TODO: had original plans to make dynamic sorting buttons but was hard to manage in ts
    const CategoryBarChart = new HorizontalBarChart(all_categories, 
    // the mapper tells the chart what data from the source `data` you actually want to plot
    // `aggregateMapper` is a way to group the data points into bins for a bar chart
    //TODO: figure out tooltip workings
    straightMapper((d) => d.Category, (b, count) => ({
        label: b,
        value: count,
        tooltip: "Calls: " + count.toString(), // TODO: Adjust to actual value for some reason gives error when tooltip shows
    }), "Count"), {
        xAxisLabel: "Calls",
        yAxisLabel: "Call Categories",
        colorScheme: ["#66aa77"]
    }, {
        parent: "#category-trend-container",
        className: "h-100",
        width: 250,
        height: 400,
        margin: { top: 50, left: 200, bottom: 50, right: 50 }
    });
    // DONUT CHART
    // VISION:
    /* Take averages of time between request and update for all selected points */
    // possibly clock shaped? or maybe a bar/timeline structure
    // selected data = ???
    //NOTICE: Moved entire chart over to pieChartTest.js and timePie.html
    // Stacked Bar Chart
    const stackData = [
        { 'xValue': "Jan", 'yValue': 0, 'zValue': 0, 'aValue': 0 },
        { 'xValue': "Feb", 'yValue': 0, 'zValue': 0, 'aValue': 0 },
        { 'xValue': "Mar", 'yValue': 0, 'zValue': 0, 'aValue': 0 },
        { 'xValue': "Apr", 'yValue': 0, 'zValue': 0, 'aValue': 0 },
        { 'xValue': "May", 'yValue': 0, 'zValue': 0, 'aValue': 0 },
        { 'xValue': "Jun", 'yValue': 0, 'zValue': 0, 'aValue': 0 },
        { 'xValue': "Jul", 'yValue': 0, 'zValue': 0, 'aValue': 0 },
        { 'xValue': "Aug", 'yValue': 0, 'zValue': 0, 'aValue': 0 },
        { 'xValue': "Sept", 'yValue': 0, 'zValue': 0, 'aValue': 0 },
        { 'xValue': "Oct", 'yValue': 0, 'zValue': 0, 'aValue': 0 },
        { 'xValue': "Nov", 'yValue': 0, 'zValue': 0, 'aValue': 0 },
        { 'xValue': "Dec", 'yValue': 0, 'zValue': 0, 'aValue': 0 },
    ];
    for (const d of data) {
        if (!d.REQUESTED_DATE) {
            return;
        }
        const stackMonth = stackData[(_a = d.REQUESTED_DATE) === null || _a === void 0 ? void 0 : _a.getMonth()];
        switch (d.STATUS) {
            case "OPEN":
                stackMonth.yValue++;
                break;
            case "CLOS":
                stackMonth.zValue++;
                break;
            default:
                stackMonth.aValue++;
                break;
        }
    }
    const stackChart = new StackedBarChart(stackData, {
        parent: "#side-panel",
        width: 300,
        height: 150,
        margin: { left: 70, top: 50, right: 50, bottom: 70 }
    });
    d3.select("#loader").remove();
}
const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec"
];
// function resetTimelineMonth(startDayforMonth?: number | string) {
//     console.log(startDayforMonth);
//     const startMonthDay = typeof startDayforMonth === "string" ? parseInt(startDayforMonth) : startDayforMonth || 0;
//     if (startMonthDay > 0 && startMonthDay < 30) {
//         d3.select("#timeline-container svg").remove();
//         timelineHist = new DateHistogramChart(alldata, binDateDayMapper((d) => d.REQUESTED_DATE, {
//             bins: "days",
//             startOfWeek: 1,
//             dayOfMonth: startMonthDay,
//         }), {
//             xAxisLabel: "Months",
//             yAxisLabel: "Number of Calls",
//             tooltipFn: (b) => b.x0 ? `${MONTH_NAMES[b.x0.getMonth()]} ${b.x0.getFullYear()}: ${b.length}` : `${b.length}`
//         }, {
//             parent: "#timeline-container",
//             className: "h-100",
//             width: 1000,
//             height: 150,
//             margin: { top: 50, left: 100, bottom: 50, right: 50 }
//         });
//     }
//     //filter data can be directly used to replace alldata (after map or other chart brushing)
//     //timelineHist.dayOfMonth = startDayforMonth;
//     //timelineHist.setData(alldata);
//     //timelineHist.render();
// }
// function resetTimelineWeek(startDayforWeek) {
//     //console.log(startDayforWeek);
//     var startWeekDay = parseInt(startDayforWeek);
//     if (startDayforWeek > 0 && startDayforWeek < 7) {
//         d3.select("#timeline-container svg").remove();
//         timelineHist = new DateHistogramChart(alldata, binDateDayMapper((d) => d.REQUESTED_DATE, {
//             bins: "weeks",
//             startOfWeek: startWeekDay,
//             dayOfMonth: 1,
//         }), {
//             xAxisLabel: "Months",
//             yAxisLabel: "Number of Calls",
//             tooltipFn: (b) => b.x0 ? `${MONTH_NAMES[b.x0.getMonth()]} ${b.x0.getFullYear()}: ${b.length}` : `${b.length}`
//         }, {
//             parent: "#timeline-container",
//             className: "h-100",
//             width: 1000,
//             height: 150,
//             margin: { top: 50, left: 100, bottom: 50, right: 50 }
//         });
//     }
// }
//# sourceMappingURL=index.js.map