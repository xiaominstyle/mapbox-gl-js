import React from 'react'; // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';
import BenchmarksTable from './benchmarks_view';
import { summaryStatistics, regression } from './lib/statistics';

export const benchmarks = [];

let promise = Promise.resolve();

export function setupTestRun(name, suite, testByLocation, loc) {
    let finished = false;
    const benchmark = { name, versions: [] };
    benchmarks.push(benchmark);

    for (const testName in suite) {
        const version = {
            name: testName,
            status: 'waiting',
            logs: [],
            samples: [],
            summary: {}
        };
        benchmark.versions.push(version);

        promise = promise.then(() => {
            version.status = 'running';
            update();

            return runTests(suite[testName], version);
        });
    }

    promise = promise.then(() => {
        finished = true;
        update(finished);
    });
}

export function runTests(test, version) {
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

export function update(finished) {
    finished = !!finished;

    ReactDOM.render(
        <BenchmarksTable benchmarks={benchmarks} finished={finished}/>,
        document.getElementById('benchmarks')
    );
}
