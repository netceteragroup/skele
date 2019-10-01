import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

const configFor = (format, dev = false) => {
  const defaultPugins = [resolve(), commonjs()]
  const suffix = dev ? '.development' : ''

  return {
    input: 'src/index.js',
    output: {
      file: `dist/${format}${suffix}.${format === 'esm' ? 'mjs' : 'js'}`,
      format: format === 'legacy' ? 'cjs' : format,
      sourcemap: !dev,
    },

    plugins: [
      ...defaultPugins,
      babel({
        exclude: 'node_modules/**',
        rootMode: 'upward',
        envName: format === 'legacy' ? 'legacy' : 'production',
      }),

      ...(dev ? [] : [terser()]),
    ],
  }
}

export default [
  configFor('cjs', false),
  configFor('cjs', true),
  configFor('esm', false),
]
