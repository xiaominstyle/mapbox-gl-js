
import Benchmark from '../lib/benchmark';
import createMap from '../lib/create_map';

const width = 1024;
const height = 768;
const zooms = [{zoom: 4}, {zoom: 8}, {zoom: 11}, {zoom: 13}, {zoom: 15}, {zoom: 17}];

const points = [];
const d = 4;
for (let x = 0; x < d; x++) {
    for (let y = 0; y < d; y++) {
        points.push([
            (x / d) * width,
            (y / d) * height
        ]);
    }
}

export default class QueryPoint extends Benchmark {

    constructor(url, locations) {
        super();
        this.url = url;
        this.locations = locations;
    }

    setup() {
        const locations = this.locations || zooms;

        return Promise.all(locations.map(location => {
            return createMap({
                zoom: location.zoom,
                width,
                height,
                center: location.center || [-77.032194, 38.912753],
                style: this.url
            });
        }))
            .then(maps => {
                this.maps = maps;
            });
    }

    bench() {
        for (const map of this.maps) {
            for (const point of points) {
                map.queryRenderedFeatures(point, {});
            }
        }
    }

    teardown() {
        for (const map of this.maps) {
            map.remove();
        }
    }
}
