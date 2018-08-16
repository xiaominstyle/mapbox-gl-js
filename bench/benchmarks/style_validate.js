
import Benchmark from '../lib/benchmark';
import validateStyle from '../../src/style-spec/validate_style.min';
import { normalizeStyleURL } from '../../src/util/mapbox';

export default class StyleValidate extends Benchmark {
    constructor(style) {
        super();
        this.style = style;
    }

    setup() {
        return fetch(normalizeStyleURL(this.style))
            .then(response => response.json())
            .then(json => { this.json = json; });
    }

    bench() {
        validateStyle(this.json);
    }
}
