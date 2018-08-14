import { locations } from '../lib/style_locations';
import { setupTestRun, benchmarks } from '../benchmarks_shared_viewmodel';

const filter = window.location.hash.substr(1);

for (const name in window.mapboxglBenchmarks) {
    if (filter && name !== filter)
        continue;

    const testByLocation = (name === 'Layout' || name === 'Paint');

    if (testByLocation) {
        // create a new test in the requested benchmark suite for each location
        // this benchmarks array is distinct from window.mapboxglBenchmarks and is used to create and update the UI
        locations.forEach(location => {
            benchmarks.push({benchmark: {
                location,
                name
            }});
        });

        for (const loc in window.mapboxglBenchmarks[name]) {
            const test = testByLocation ? window.mapboxglBenchmarks[name][loc] : window.mapboxglBenchmarks[name];

            // we have to add the versions array here
            // otherwise, we end up duplicating tests
            benchmarks.forEach(bench => {
                if (bench.hasOwnProperty('benchmark')) {
                    bench.benchmark.versions = [];
                }
            });
            setupTestRun(name, test, testByLocation, loc);
        }
    } else {
        const test = window.mapboxglBenchmarks[name];
        setupTestRun(name, test);
    }
}
