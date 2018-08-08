import fs from 'fs';
import sourcemaps from 'rollup-plugin-sourcemaps';
import replace from 'rollup-plugin-replace';
import {plugins as basePlugins} from '../build/rollup_plugins';

const plugins = () => basePlugins().concat(
    replace({
        'process.env.BENCHMARK_VERSION': JSON.stringify(process.env.BENCHMARK_VERSION),
        'process.env.MAPBOX_ACCESS_TOKEN': JSON.stringify(process.env.MAPBOX_ACCESS_TOKEN),
        'process.env.MapboxAccessToken': JSON.stringify(process.env.MapboxAccessToken),
        'process.env.MAPBOX_STYLE_URL': JSON.stringify(process.env.MAPBOX_STYLE_URL),
        'process.env.MapboxStyleURL': JSON.stringify(process.env.MapboxStyleURL),
        'process.env.STYLE_BENCHMARK': JSON.stringify(process.env.STYLE_BENCHMARK),
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
);

const testFolder = process.env.STYLE_BENCH ? 'style-tests' : 'version-tests';

const config = [{
    input: [`bench/${testFolder}/benchmarks.js`, 'src/source/worker.js'],
    output: {
        dir: 'rollup/build/benchmarks',
        format: 'amd',
        sourcemap: 'inline'
    },
    experimentalCodeSplitting: true,
    plugins: plugins()
}, {
    input: 'rollup/benchmarks.js',
    output: {
        file: 'bench/benchmarks_generated.js',
        format: 'umd',
        sourcemap: 'inline',
        intro: fs.readFileSync(require.resolve('../rollup/bundle_prelude.js'), 'utf8')
    },
    treeshake: false,
    indent: false,
    plugins: [sourcemaps()],
}];

export default config;
