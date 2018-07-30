
import Benchmark from '../lib/benchmark';
import createMap from '../lib/create_map';

const width = 1024;
const height = 768;
const zooms = [4, 8, 11, 13, 15, 17];

export default class Paint extends Benchmark {
    setup() {
        let promises = [];
        if (this.locations) {
            promises.push(createMap({
                zoom: this.locations.zoom,
                width,
                height,
                center: this.locations.center,
                style: this.styleURL
            }));
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
            map._styleDirty = true;
            map._sourcesDirty = true;
            map._render();
        }
    }

    teardown() {
        for (const map of this.maps) {
            map.remove();
        }
    }
}
