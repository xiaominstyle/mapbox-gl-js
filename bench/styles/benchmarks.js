// @flow

import mapboxgl from '../../src';
import { accessToken } from '../lib/parameters';
import { locations } from '../lib/style_locations';
import { runTests, update, benchmarks } from '../benchmarks_shared_viewmodel';

mapboxgl.accessToken = accessToken;

window.mapboxglBenchmarks = window.mapboxglBenchmarks || {};

const urls = (process.env.MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/streets-v10').split(',');
// const benchmarks = [];
let promise = Promise.resolve();

function createBenchmark(Benchmark, locations, options) {
    const benchmark = {
        name: Benchmark.name,
        versions: []
    };

    if (options) Object.assign(benchmark, options);

    urls.forEach(style => {
        benchmark.bench = new Benchmark(style, locations)
        benchmark.versions.push({
            name: style,
            status: 'waiting',
            logs: [],
            samples: [],
            summary: {}
        });
    });
    benchmarks.push(benchmark);
}

function register(Benchmark) {
    const name = Benchmark.name;
    switch (name) {
      case 'Layout':
      case 'Paint':
        locations.forEach(location => {
          createBenchmark(Benchmark, [location], {location});
        });
        break;
      case 'QueryBox':
      case 'QueryPoint':
        createBenchmark(Benchmark, locations);
        break;
      default:
        createBenchmark(Benchmark);
    }

    console.log('benchmarks', benchmarks);

    // sort by the style urls instead of the branch name so that a style benchmark can run the same branch multiple times with differing style urls
    // urls.forEach((style) => {
    //     if (!window.mapboxglBenchmarks[name]) {
    //         window.mapboxglBenchmarks[name] = {};
    //     }
    //
    //     switch (name) {
    //     case 'Layout':
    //     case 'Paint':
    //         // create tests for each location/tile
    //         // we do this because with styles, it's important to see how a style responds on various types of tiles
    //         // (e.g. CJK, dense urban, rural, etc) rather than averaging all tiles together into one result
    //         locations.forEach(location => {
    //             const descriptor = location.description.toLowerCase().split(' ').join('_');
    //             if (!window.mapboxglBenchmarks[name][descriptor]) {
    //                 window.mapboxglBenchmarks[name][descriptor] = {};
    //             }
    //             window.mapboxglBenchmarks[name][descriptor][style] = new Benchmark(style, [location]);
    //         });
    //         break;
    //     case 'QueryBox':
    //     case 'QueryPoint':
    //         // QueryBox and QueryPoint need the locations but do not need to be processed per-location (e.g. can be averaged into one test) so we can can just process them as normal
    //         window.mapboxglBenchmarks[name][style] = new Benchmark(style, locations);
    //         break;
    //     // default case covers StyleLayerCreate and StyleValidate
    //     // StyleLayerCreate and StyleValidate are important for benching styles but are not location dependent so process them like normal bench tests
    //     default:
    //         window.mapboxglBenchmarks[name][style] = new Benchmark(style);
    //     }
    // });
    // console.log('window.mapboxglBenchmarks', window.mapboxglBenchmarks);
}

function runBenchmarks() {
    benchmarks.forEach(bench => {
      bench.versions.forEach(version => {
        promise = promise.then(() => {
          version.status = 'running';
          update();

          return runTests(bench.bench, version);
        });
      });

      promise = promise.then(() => {
          update(true);
      });
    });
}

import StyleLayerCreate from '../benchmarks/style_layer_create';
import Validate from '../benchmarks/style_validate';
import Layout from '../benchmarks/layout';
import Paint from '../benchmarks/paint';
import QueryPoint from '../benchmarks/query_point';
import QueryBox from '../benchmarks/query_box';

register(Layout);
register(Paint);
register(StyleLayerCreate);
register(Validate);
register(QueryPoint);
register(QueryBox);

runBenchmarks();

import getWorkerPool from '../../src/util/global_worker_pool';

setTimeout(() => {
    // Ensure the global worker pool is never drained. Browsers have resource limits
    // on the max number of workers that can be created per page.
    // We do this async to avoid creating workers before the worker bundle blob
    // URL has been set up, which happens after this module is executed.
    getWorkerPool().acquire(-1);
}, 0);

export default mapboxgl;
