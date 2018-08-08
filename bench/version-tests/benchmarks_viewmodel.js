import { setupTestRun } from '../benchmarks_shared_viewmodel';

const filter = window.location.hash.substr(1);

for (const name in window.mapboxglBenchmarks) {
    if (filter && name !== filter)
        continue;

    const test = window.mapboxglBenchmarks[name];
    setupTestRun(name, test);
}
