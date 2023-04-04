interface LeafletConfig<D extends MapData> extends VisualizationConfig<D> {
    parentElement: string | HTMLElement;
    markerRadius: number;
    focusRadius: number;
    initialZoom?: number;
    initialCenter?: [number, number];
    onRegionSelect?: (bounds: L.LatLngBounds | undefined) => void;
}
interface TileLayerConfig {
    url: string;
    attribution: string;
}
declare const FreeTileLayers: {
    ESRI: L.TileLayer;
    TOPO: L.TileLayer;
    StamenTerrain: L.TileLayer;
};
declare function createTileLayer(config: TileLayerConfig): L.TileLayer;
interface MapData {
    latitude: number;
    longitude: number;
    tooltip: string;
}
declare class LeafletMap<T, D extends MapData> extends AbstractVisualization<T, D, LeafletConfig<D>> {
    protected dataMapper: DataMapperFn<T, D>;
    protected chartConfig: LeafletConfig<D>;
    /** this is the base map layer, where we are showing the map background. */
    private baseLayer;
    private map;
    private svg;
    private dots;
    brushBounds?: L.LatLngBounds;
    protected brush?: d3.BrushBehavior<unknown>;
    protected brushG?: d3.Selection<SVGGElement, unknown, null, undefined>;
    mode: "brush" | "navigate";
    switchBaseLayer(newLayer: L.TileLayer): void;
    activateBrushMode(): void;
    disableBrushMode(): void;
    constructor(rawData: T[], dataMapper: DataMapperFn<T, D>, chartConfig: LeafletConfig<D>);
    updateVis(): void;
    render(): void;
}
//# sourceMappingURL=LeafletMap.d.ts.map