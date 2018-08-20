import React from 'react'; // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';
import BenchmarksTable from './benchmarks_view';
import { summaryStatistics, regression } from './lib/statistics';

export const benchmarks = [];

let promise = Promise.resolve();

export function setupTestRun(name, suite, testByLocation, loc) {
    let finished = false;
    const benchmark = { name, versions: [] };
    if (!testByLocation) {
        benchmarks.push(benchmark);
    }
    for (const testName in suite) {
        let version;
        if (testByLocation) {
            // push a test object for each member of a test suite (style or version)
            benchmarks.forEach(bench => {
                bench.versions.push(createVersion(testName));
            });
        } else {
            version = createVersion(testName);
            console.log('version', version);
            benchmark.versions.push(version);
        }
        // console.log('version', name, version);
        promise = promise.then(() => {
            if (!version) {
                console.log('benchmarks', benchmarks);
                // we have to find the correct version to update on each test run or else the UI will not update properly
                const versions = benchmarks.filter(bench => { console.log('bench', bench); return bench.location && bench.location.description.toLowerCase().split(' ').join('_') === loc && bench.name === name})[0].versions;
                version = versions.filter(version => version.name === testName)[0];
            }
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

function update(finished) {
    finished = !!finished;
    // console.log('benchmarks', benchmarks);

    ReactDOM.render(
        <BenchmarksTable benchmarks={benchmarks} finished={finished}/>,
        document.getElementById('benchmarks')
    );
}
