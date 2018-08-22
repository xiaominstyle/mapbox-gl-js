// @flow

import mapboxgl from '../../src';
import accessToken from '../lib/access_token';
import locations from '../lib/style_locations';
import { summaryStatistics, regression } from '../lib/statistics';
import updateUI from '../benchmarks_view';

mapboxgl.accessToken = accessToken;

const urls = (process.env.MAPBOX_STYLE_URL || 'mapbox://styles/mapbox/streets-v10').split(',');
const benchmarks = [];

function createBenchmark(Benchmark, locations, options) {
    const benchmark = {
        name: Benchmark.name,
        versions: []
    };

    if (options) Object.assign(benchmark, options);

    urls.forEach(style => {
        benchmark.bench = new Benchmark(style, locations);
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

const filter = window.location.hash.substr(1);

function register(Benchmark) {
    const name = Benchmark.name;

    if (filter && name !== filter)
        return;

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
}

let promise = Promise.resolve();

function runBenchmarks() {
    benchmarks.forEach(bench => {
        bench.versions.forEach(version => {
            promise = promise.then(() => {
                version.status = 'running';
                updateUI(benchmarks);

                return bench.bench.run()
                    .then(measurements => {
                        // scale measurements down by iteration count, so that
                        // they represent (average) time for a single iteration
                        const samples = measurements.map(({time, iterations}) => time / iterations);
                        version.status = 'ended';
                        version.samples = samples;
                        version.summary = summaryStatistics(samples);
                        version.regression = regression(measurements);
                        updateUI(benchmarks);
                    })
                    .catch(error => {
                        version.status = 'errored';
                        version.error = error;
                        updateUI(benchmarks);
                    });
            });
        });

        promise = promise.then(() => {
            updateUI(benchmarks, true);
        });
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
