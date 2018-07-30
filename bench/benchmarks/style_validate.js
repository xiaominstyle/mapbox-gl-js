
import Benchmark from '../lib/benchmark';
import validateStyle from '../../src/style-spec/validate_style.min';
import { normalizeStyleURL } from '../../src/util/mapbox';

export default class StyleValidate extends Benchmark {
    setup() {
        return fetch(normalizeStyleURL(this.styleURL))
            .then(response => response.json())
            .then(json => { this.json = json; });
    }

    bench() {
        validateStyle(this.json);
    }
}
