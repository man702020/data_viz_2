"use strict";
function createSVG(drawConfig) {
    const margin = drawConfig.margin || { top: 0, bottom: 0, left: 0, right: 0 };
    const width = drawConfig.width + margin.left + margin.right;
    const height = drawConfig.height + margin.top + margin.bottom;
    const svg = d3.select(drawConfig.parent).append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`);
    if (drawConfig.className) {
        svg.attr("class", drawConfig.className);
    }
    return svg;
}
function replaceAll(string, search, replace) {
    if (string == undefined) {
        return undefined;
    }
    return string.split(search).join(replace);
}
function wrapAxisText(text, width) {
    text.each(function () {
        var _a;
        const text = d3.select(this);
        const words = text.text().split(/\s+/).reverse();
        let word;
        let line = [];
        let lineNumber = 0;
        const lineHeight = 1.1;
        const y = text.attr("y");
        const dy = parseFloat(text.attr("dy"));
        let tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if ((((_a = tspan.node()) === null || _a === void 0 ? void 0 : _a.getComputedTextLength()) || 0) > width && line.length > 1) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", `${++lineNumber * lineHeight + dy}em`).text(word);
            }
        }
    });
}
const tooltipElement = d3.select("#tooltip");
function enableTooltip(sel, ttFn) {
    sel
        .on("mouseover", (ev, d) => {
        const tooltip = ttFn(d);
        if (!tooltip) {
            return;
        }
        tooltipElement
            .style("top", (ev.layerY + 5) + "px")
            .style("left", (ev.layerX + 5) + "px")
            .style("visibility", "visible")
            .html(tooltip);
    })
        .on("mouseout", () => {
        tooltipElement.style("visibility", "hidden");
    });
}
function elementMapper(mapFn) {
    return (sourceData) => {
        const data = [];
        let unknownCount = 0;
        for (const t of sourceData) {
            const d = mapFn(t);
            if (d !== undefined) {
                data.push(d);
            }
            else {
                unknownCount++;
            }
        }
        return { data, unknownCount };
    };
}
function aggregateMapper(bucketFn, mapFn) {
    return (sourceData) => {
        const dict = {};
        let unknownCount = 0;
        for (const t of sourceData) {
            const key = bucketFn(t);
            if (!key) {
                unknownCount++;
                continue;
            }
            if (key in dict) {
                dict[key]++;
            }
            else {
                dict[key] = 1;
            }
        }
        const data = Object.entries(dict).map(([bucket, count]) => mapFn(bucket, count));
        return { data, unknownCount };
    };
}
// same as aggregate mapper but sorts data by week (DEPRECIATED)
function weekMapper(bucketFn, mapFn) {
    return (sourceData) => {
        const dict = {};
        let unknownCount = 0;
        for (const t of sourceData) {
            const key = bucketFn(t);
            if (!key) {
                unknownCount++;
                continue;
            }
            if (key in dict) {
                dict[key]++;
            }
            else {
                dict[key] = 1;
            }
        }
        //console.log("presort",dict) // My attempts to sort are not working
        //function sortCount(a: any, b:any) {
        //    return a.value < b.value ? -1 : (a.value > b.value ? 1 : 0);
        //}
        const data = Object.entries(dict).map(([bucket, count]) => mapFn(bucket, count));
        return { data, unknownCount };
    };
}
// just uses straight up raw data passed to it using given keys and value as valuestr
function straightMapper(bucketFn, mapFn, valueStr) {
    return (sourceData) => {
        const dict = {};
        let unknownCount = 0;
        for (const t of sourceData) {
            const key = bucketFn(t);
            if (!key) {
                unknownCount++;
                continue;
            }
            //console.log('t:',t,t[valueStr]);
            if (valueStr == undefined) {
                valueStr = key;
            }
            dict[key] = t[valueStr]; // shows error but idk how to fix
        }
        const data = Object.entries(dict).map(([bucket, count]) => mapFn(bucket, count));
        // sort data (another attempt not working :())
        //console.log("Presort",data)
        //const sortData = data.sort((a, b) => b.value - a.value)
        //console.log("postsort",sortData)
        return { data, unknownCount };
    };
}
//Grabs and uses specific pie data for fun.
function timePieMapper(bucketFn, mapFn) {
    return (sourceData) => {
        const dict = {};
        let unknownCount = 0;
        for (const t of sourceData) {
            const key = bucketFn(t);
            console.log("piet", t, key);
            if (!key) {
                unknownCount++;
                continue;
            }
        }
        const data = Object.entries(dict).map(([bucket, count]) => mapFn(bucket, count));
        const organizedData = Object.entries(dict);
        console.log("finalData", data, organizedData);
        return { data, unknownCount };
    };
}
// Does nothing just to get around the forced use of mappers
function emptyMapper(bucketFn, mapFn, valueStr) {
    return (sourceData) => {
        const dict = {};
        let unknownCount = 0;
        for (const t of sourceData) {
            const key = bucketFn(t);
            if (!key) {
                unknownCount++;
                continue;
            }
            //console.log('t:',t,t[valueStr]);
            dict[key] = 0; // shows error but idk how to fix
        }
        const data = Object.entries(dict).map(([bucket, count]) => mapFn(bucket, count));
        return { data, unknownCount };
    };
}
function binMapper(mapFn, binConfig) {
    let bin = d3.bin();
    if (binConfig === null || binConfig === void 0 ? void 0 : binConfig.bins) {
        bin = bin.thresholds(binConfig.bins);
    }
    return (sourceData) => {
        const mapData = [];
        let unknownCount = 0;
        for (const t of sourceData) {
            const d = mapFn(t);
            if (d !== undefined) {
                mapData.push(d);
            }
            else {
                unknownCount++;
            }
        }
        const data = bin(mapData);
        return { data, unknownCount };
    };
}
function thresholdTime(n) {
    return (_data, min, max) => {
        return d3.scaleTime().domain([min, max]).ticks(n);
    };
}
function binDateMapper(mapFn, binConfig) {
    let bin = d3.bin();
    if (binConfig === null || binConfig === void 0 ? void 0 : binConfig.bins) {
        if (binConfig.bins === "months") {
            bin = bin.thresholds((arr, min, max) => d3.scaleTime().domain([min, max]).ticks((max.getFullYear() * 12 + max.getMonth()) -
                (min.getFullYear() * 12 + min.getMonth())));
        }
        else {
            bin = bin.thresholds(thresholdTime(binConfig.bins));
        }
    }
    return (sourceData) => {
        const mapData = [];
        let unknownCount = 0;
        for (const t of sourceData) {
            const d = mapFn(t);
            if (d !== undefined) {
                mapData.push(d);
            }
            else {
                unknownCount++;
            }
        }
        const data = bin(mapData);
        return { data, unknownCount };
    };
}
function binDateDayMapper(mapFn, binConfig) {
    let bin = d3.bin();
    if (binConfig.bins === "months") {
        bin = bin.thresholds((arr, min, max) => d3.timeMonth.range(min, max));
    }
    else if (binConfig.bins === "weeks") {
        bin = bin.thresholds((arr, min, max) => d3.timeWeek.range(min, max));
    }
    else if (binConfig.bins === "days") {
        bin = bin.thresholds((arr, min, max) => d3.timeDay.range(min, max));
    }
    else {
        bin = bin.thresholds(thresholdTime(binConfig.bins));
    }
    return (sourceData) => {
        const mapData = [];
        let unknownCount = 0;
        for (const t of sourceData) {
            const d = mapFn(t);
            if (d !== undefined) {
                mapData.push(d);
            }
            else {
                unknownCount++;
            }
        }
        const data = bin(mapData);
        return { data, unknownCount };
    };
}
//# sourceMappingURL=utils.js.map