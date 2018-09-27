import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    file: './build/keystroke-visualizer.js',
    format: 'umd',
    name: 'KEYVIS'
  },
  plugins: [
    babel({
      include: [
        'src/**'
      ]
    }),
    resolve(),
    commonjs(),
    cleanup({
      comments: 'none',
    }),
  ],
};