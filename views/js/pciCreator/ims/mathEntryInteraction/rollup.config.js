import nodeResolve from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs';

const dependencies = [{
    src: 'node_modules/@qtikit/mathml-to-latex/dist/index.js',
    dst: 'runtime/mathml-to-latex/mathml-to-latex.js',
    name: 'Mathml2latex'
}]

const dependencyBundle = dependency => ({
    input: dependency.src,
    output: {
        name: dependency.name,
        file: dependency.dst,
        format: 'umd'
    },
    plugins: [
        nodeResolve(),
        commonJS()
    ]
});

export default dependencies.map(dependencyBundle)