import { runTests, update, benchmarks } from '../benchmarks_shared_viewmodel';

const filter = window.location.hash.substr(1);
let promise = Promise.resolve();

for (const name in window.mapboxglBenchmarks) {
    console.log('window.mapboxglBenchmarks', window.mapboxglBenchmarks);
    if (filter && name !== filter)
        continue;

    let finished = false;
    const benchmark = { name, versions: [] };
    benchmarks.push(benchmark);

    for (const test in window.mapboxglBenchmarks[name]) {
        const version = {
            name: test,
            status: 'waiting',
            logs: [],
            samples: [],
            summary: {}
        };
        benchmark.versions.push(version);

        promise = promise.then(() => {
            version.status = 'running';
            update();

            return runTests(window.mapboxglBenchmarks[name][test], version);
        });
    }

    promise = promise.then(() => {
        finished = true;
        update(finished);
    });
}
