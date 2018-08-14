// @flow

import mapboxgl from '../../src';
import { accessToken, styleURL } from '../lib/parameters';
import { locations } from '../lib/style_locations';

mapboxgl.accessToken = accessToken;

window.mapboxglVersions = window.mapboxglVersions || [];
window.mapboxglBenchmarks = window.mapboxglBenchmarks || {};

const version = process.env.BENCHMARK_VERSION;
window.mapboxglVersions.push(version);

function register(Benchmark) {
    // sort by the style urls instead of the branch name so that a style benchmark can run the same branch multiple times with differing style urls
    styleURL(true).forEach((style) => {
        if (!window.mapboxglBenchmarks[Benchmark.name]) {
            window.mapboxglBenchmarks[Benchmark.name] = {};
        }

        switch (Benchmark.name) {
        case 'Layout':
        case 'Paint':
            // create tests for each location/tile
            // we do this because with styles, it's important to see how a style responds on various types of tiles
            // (e.g. CJK, dense urban, rural, etc) rather than averaging all tiles together into one result
            locations.forEach(location => {
                const descriptor = location.description.toLowerCase().split(' ').join('_');
                if (!window.mapboxglBenchmarks[Benchmark.name][descriptor]) {
                    window.mapboxglBenchmarks[Benchmark.name][descriptor] = {};
                }
                window.mapboxglBenchmarks[Benchmark.name][descriptor][style] = new Benchmark(style, [location]);
            });
            break;
        // default case covers StyleLayerCreate, StyleValidate, QueryBox and QueryPoint
        // StyleLayerCreate and StyleValidate are important for benching styles but are not location dependent so process them like normal bench tests
        // QueryBox and QueryPoint need the locations but do not need to be processed per-location (e.g. can be averaged into one test) so we can can just process them as normal
        default:
            window.mapboxglBenchmarks[Benchmark.name][style] = new Benchmark(style, locations);
        }
    });
}

import StyleLayerCreate from '../benchmarks/style_layer_create';
import Validate from '../benchmarks/style_validate';
import Layout from '../benchmarks/layout';
import Paint from '../benchmarks/paint';
import QueryPoint from '../benchmarks/query_point';
import QueryBox from '../benchmarks/query_box';

register(StyleLayerCreate);
register(Validate);
register(Layout);
register(Paint);
register(QueryPoint);
register(QueryBox);

import getWorkerPool from '../../src/util/global_worker_pool';

setTimeout(() => {
    // Ensure the global worker pool is never drained. Browsers have resource limits
    // on the max number of workers that can be created per page.
    // We do this async to avoid creating workers before the worker bundle blob
    // URL has been set up, which happens after this module is executed.
    getWorkerPool().acquire(-1);
}, 0);

export default mapboxgl;
