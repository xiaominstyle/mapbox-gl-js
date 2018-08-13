import React from 'react'; // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';
import BenchmarksTable from './benchmarks_view';
import { summaryStatistics, regression } from './lib/statistics';

export const benchmarks = [];

let finished = false;
let promise = Promise.resolve();

export function setupTestRun(name, suite, testByLocation, loc) {
    const benchmark = { name, versions: [] };
    if (!testByLocation) {
        benchmarks.push(benchmark);
    }
    for (const testName in suite) {
        let version;
        if (testByLocation) {
            // push a test object for each member of a test suite (style or version)
            benchmarks.forEach(bench => {
                if (bench.hasOwnProperty('benchmark')) {
                    bench.benchmark.versions.push(createVersion(testName));
                }
            });
        } else {
            version = createVersion(testName);
            benchmark.versions.push(version);
        }

        promise = promise.then(() => {
            if (!version) {
                // we have to find the correct version to update on each test run or else the UI will not update properly
                const versions = benchmarks.filter(bench => bench.benchmark && bench.benchmark.location.description.toLowerCase().split(' ').join('_') === loc && bench.benchmark.name === name)[0].benchmark.versions;
                version = versions.filter(version => version.name === testName)[0];
            }
            version.status = 'running';
            update();

            return runTests(suite[testName], version);
        });
    }
}

function createVersion(testName) {
    return {
        name: testName,
        status: 'waiting',
        logs: [],
        samples: [],
        summary: {}
    };
}

function runTests(test, version) {
    return test.run()
        .then(measurements => {
            // scale measurements down by iteration count, so that
            // they represent (average) time for a single iteration
            const samples = measurements.map(({time, iterations}) => time / iterations);
            version.status = 'ended';
            version.samples = samples;
            version.summary = summaryStatistics(samples);
            version.regression = regression(measurements);
            update();
        })
        .catch(error => {
            version.status = 'errored';
            version.error = error;
            update();
        });
}

promise = promise.then(() => {
    finished = true;
    update();
});

function update() {
    ReactDOM.render(
        <BenchmarksTable benchmarks={benchmarks} finished={finished}/>,
        document.getElementById('benchmarks')
    );
}
