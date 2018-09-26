/*
import fs from 'fs';
import path from 'path';*/
import commonjs from 'rollup-plugin-commonjs';
//import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
// import babel from 'rollup-plugin-babel';
//const banner = fs.readFileSync(path.join(__dirname, 'licenses.txt'));

export default {
  input: 'src/index.js',
  output: {
    file: './build/keystroke-visualizer.js',
    format: 'umd',
    name: 'KeystrokeVisualizer'
  },
  plugins: [
    /*
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    babel({
      include: [
        'src/**'
      ]
    }),*/
    resolve(),
    commonjs(),
    cleanup({
      comments: 'none',
    }),
  ],
};