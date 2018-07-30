
import Benchmark from '../lib/benchmark';
import createMap from '../lib/create_map';

const width = 1024;
const height = 768;
const zooms = [4, 8, 11, 13, 15, 17];

export default class QueryBox extends Benchmark {
    setup() {
        let promises = [];
        if (this.locations) {
            promises = this.locations.map(location => {
                return createMap({
                    zoom: location.zoom,
                    width,
                    height,
                    center: location.center,
                    style: this.styleURL
                });
            });
        } else {
            promises = zooms.map(zoom => {
                return createMap({
                    zoom,
                    width,
                    height,
                    center: [-77.032194, 38.912753],
                    style: this.styleURL
                });
            });
        }

        return Promise.all(promises)
            .then(maps => {
                this.maps = maps;
            });
    }

    bench() {
        for (const map of this.maps) {
            map.queryRenderedFeatures({});
        }
    }

    teardown() {
        for (const map of this.maps) {
            map.remove();
        }
    }
}
