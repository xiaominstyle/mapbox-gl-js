import React from 'react'; // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';
import BenchmarksTable from './benchmarks_view';
import { summaryStatistics, regression } from './lib/statistics';

export const benchmarks = [];

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
