// @flow

import mapboxgl from '../../src';
import { accessToken } from '../lib/parameters';
mapboxgl.accessToken = accessToken;

window.mapboxglVersions = window.mapboxglVersions || [];
window.mapboxglBenchmarks = window.mapboxglBenchmarks || {};

const style = 'mapbox://styles/mapbox/streets-v10';
const center = [-77.032194, 38.912753];
const zooms = [4, 8, 11, 13, 15, 17];
const locations = zooms.map(zoom => ({center, zoom}));
const version = process.env.BENCHMARK_VERSION;
window.mapboxglVersions.push(version);

function register(Benchmark) {
    window.mapboxglBenchmarks[Benchmark.name] = window.mapboxglBenchmarks[Benchmark.name] || {};

    switch (Benchmark.name) {
    case 'Paint':
    case 'QueryPoint':
    case 'QueryBox':
    case 'Layout':
        window.mapboxglBenchmarks[Benchmark.name][version] = new Benchmark(style, locations);
        break;
    case 'StyleLayerCreate':
    case 'StyleValidate':
    case 'FunctionCreate':
    case 'FunctionConvert':
    case 'FunctionEvaluate':
    case 'ExpressionCreate':
    case 'ExpressionEvaluate':
        window.mapboxglBenchmarks[Benchmark.name][version] = new Benchmark(style);
        break;
    case 'PaintStates':
        window.mapboxglBenchmarks[Benchmark.name][version] = new Benchmark(center);
        break;
    // MapLoad, LayoutDDS, Layers, FilterEvaluate, FilterCreate
    default:
        window.mapboxglBenchmarks[Benchmark.name][version] = new Benchmark();
    }
}

import Layout from '../benchmarks/layout';
import LayoutDDS from '../benchmarks/layout_dds';
import Paint from '../benchmarks/paint';
import PaintStates from '../benchmarks/paint_states';
import LayerBenchmarks from '../benchmarks/layers';
import Load from '../benchmarks/map_load';
import Validate from '../benchmarks/style_validate';
import StyleLayerCreate from '../benchmarks/style_layer_create';
import QueryPoint from '../benchmarks/query_point';
import QueryBox from '../benchmarks/query_box';
import ExpressionBenchmarks from '../benchmarks/expressions';
import FilterCreate from '../benchmarks/filter_create';
import FilterEvaluate from '../benchmarks/filter_evaluate';

register(Layout);
register(LayoutDDS);
register(Paint);
register(PaintStates);
LayerBenchmarks.forEach(register);
register(Load);
register(Validate);
register(StyleLayerCreate);
register(QueryPoint);
register(QueryBox);
ExpressionBenchmarks.forEach(register);
register(FilterCreate);
register(FilterEvaluate);

import getWorkerPool from '../../src/util/global_worker_pool';

setTimeout(() => {
    // Ensure the global worker pool is never drained. Browsers have resource limits
    // on the max number of workers that can be created per page.
    // We do this async to avoid creating workers before the worker bundle blob
    // URL has been set up, which happens after this module is executed.
    getWorkerPool().acquire(-1);
}, 0);

export default mapboxgl;
