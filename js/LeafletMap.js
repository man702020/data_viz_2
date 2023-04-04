"use strict";
const FreeTileLayers = {
    ESRI: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    }),
    TOPO: L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
        attribution: "Map data: &copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors, <a href=\"http://viewfinderpanoramas.org\">SRTM</a> | Map style: &copy; <a href=\"https://opentopomap.org\">OpenTopoMap</a> (<a href=\"https://creativecommons.org/licenses/by-sa/3.0/\">CC-BY-SA</a>)",
    }),
    StamenTerrain: L.tileLayer("https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png", {
        attribution: "Map tiles by <a href=\"http://stamen.com\">Stamen Design</a>, <a href=\"http://creativecommons.org/licenses/by/3.0\">CC BY 3.0</a> &mdash; Map data &copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors"
    })
};
function createTileLayer(config) {
    return L.tileLayer(config.url, {
        id: "tile-image",
        attribution: config.attribution,
    });
}
class LeafletMap extends AbstractVisualization {
    switchBaseLayer(newLayer) {
        this.map.addLayer(newLayer);
        this.map.removeLayer(this.baseLayer);
        this.baseLayer = newLayer;
    }
    activateBrushMode() {
        this.mode = "brush";
        this.map.dragging.disable();
        if (!this.brushG) {
            this.brush = d3.brush()
                .filter(() => this.mode === "brush")
                .on("end", (e) => {
                var _a, _b;
                if (!e.selection || !Array.isArray(e.selection[0]) || !Array.isArray(e.selection[1])) {
                    return;
                }
                const p0 = this.map.layerPointToLatLng(e.selection[0]);
                const p1 = this.map.layerPointToLatLng(e.selection[1]);
                this.brushBounds = new L.LatLngBounds(p0, p1);
                (_b = (_a = this.chartConfig).onRegionSelect) === null || _b === void 0 ? void 0 : _b.call(_a, this.brushBounds);
            });
            this.brushG = this.svg.insert("g", ":first-child")
                .attr("class", "map-brush")
                .call(this.brush);
        }
    }
    disableBrushMode() {
        this.mode = "navigate";
        this.map.dragging.enable();
    }
    constructor(rawData, dataMapper, chartConfig) {
        super();
        this.dataMapper = dataMapper;
        this.chartConfig = chartConfig;
        /** this is the base map layer, where we are showing the map background. */
        this.baseLayer = FreeTileLayers.StamenTerrain;
        this.mode = "navigate";
        this.setData(rawData);
        /**
         * We initialize scales/axes and append static elements, such as axis titles.
         */
        this.map = L.map(this.chartConfig.parentElement, {
            center: this.chartConfig.initialCenter || [30, 0],
            zoom: this.chartConfig.initialZoom || 2,
            layers: [this.baseLayer]
        });
        // if you stopped here, you would just have a map
        // initialize svg for d3 to add to map
        L.svg().addTo(this.map);
        const overlay = d3.select(this.map.getPanes().overlayPane);
        this.svg = overlay.select("svg").attr("pointer-events", "auto");
        d3.select("#map-brush-switch-off").on("change", () => this.disableBrushMode());
        d3.select("#map-brush-switch-on").on("change", () => this.activateBrushMode());
        d3.select("#map-brush-clear").on("click", () => {
            var _a, _b, _c;
            if (this.brush) {
                (_a = this.brushG) === null || _a === void 0 ? void 0 : _a.call(this.brush.clear);
                (_c = (_b = this.chartConfig).onRegionSelect) === null || _c === void 0 ? void 0 : _c.call(_b, undefined);
            }
        });
        //handler here for updating the map, as you zoom in and out
        this.map.on("zoomend", () => {
            this.updateVis();
        });
        this.render();
    }
    updateVis() {
        var _a;
        // want to see how zoomed in you are?
        console.log(this.map.getZoom()); // how zoomed am I
        // want to control the size of the radius to be a certain number of meters?
        // if( this.map.getZoom > 15 ){
        //   metresPerPixel = 40075016.686 * Math.abs(Math.cos(map.getCenter().lat * Math.PI/180)) / Math.pow(2, map.getZoom()+8);
        //   desiredMetersForPoint = 100; //or the uncertainty measure... =)
        //   radiusSize = desiredMetersForPoint / metresPerPixel;
        // }
        // redraw based on new zoom- need to recalculate on-screen position
        this.dots
            .attr("cx", d => this.map.latLngToLayerPoint([d.latitude, d.longitude]).x)
            .attr("cy", d => this.map.latLngToLayerPoint([d.latitude, d.longitude]).y)
            .attr("r", this.chartConfig.markerRadius);
        if (this.brush && this.brushBounds) {
            const nw = this.map.latLngToLayerPoint(this.brushBounds.getNorthWest());
            const se = this.map.latLngToLayerPoint(this.brushBounds.getSouthEast());
            (_a = this.brushG) === null || _a === void 0 ? void 0 : _a.call(this.brush.move, [[nw.x, nw.y], [se.x, se.y]]);
        }
    }
    render() {
        this.dots = this.svg.selectAll('.call-marker').data(this.data).join('circle')
            .attr("class", "call-marker")
            .attr("fill", "steelblue")
            .attr("stroke", "black")
            // Leaflet has to take control of projecting points. Here we are feeding the latitude and longitude coordinates to
            // leaflet so that it can project them on the coordinates of the view. Notice, we have to reverse lat and lon.
            // Finally, the returned conversion produces an x and y point. We have to select the the desired one using .x or .y
            .attr("cx", d => this.map.latLngToLayerPoint([d.latitude, d.longitude]).x)
            .attr("cy", d => this.map.latLngToLayerPoint([d.latitude, d.longitude]).y)
            .attr("r", 3)
            .on('mouseover', function (_event, d) {
            d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                .duration(150) //how long we are transitioning between the two states (works like keyframes)
                .attr("fill", "red") //change the fill
                .attr('r', 4); //change radius
            //create a tool tip
            d3.select('#tooltip')
                .style('visibility', "visible")
                .style('z-index', 1000000)
                // Format number with million and thousand separator
                .html(`<div class="tooltip-label">${d.tooltip}</div>`);
        })
            .on('mousemove', (event) => {
            //position the tooltip
            d3.select('#tooltip')
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY + 10) + 'px');
        })
            .on('mouseleave', function () {
            d3.select(this).transition() //D3 selects the object we have moused over in order to perform operations on it
                .duration(150) //how long we are transitioning between the two states (works like keyframes)
                .attr("fill", "steelblue") //change the fill
                .attr('r', 3); //change radius
            d3.select('#tooltip').style('visibility', "hidden"); //turn off the tooltip
        })
            .on('click', (_event, d) => {
            this.map.flyTo([d.latitude, d.longitude], this.map.getZoom());
        });
    }
}
//# sourceMappingURL=LeafletMap.js.map