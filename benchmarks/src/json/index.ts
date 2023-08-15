import process from 'process'

import { suite, add } from 'benny'

import { handlers } from '../@helpers'

import { SAMPLE } from './@sample'
import { parse as parseParjs } from './parjs'
import { parse as parseSigmaDefer } from './sigma'
import { parse as parseSigmaGrammar } from './sigma-grammar'

const benchmarks = {
  'sigma:grammar': () => parseSigmaGrammar(SAMPLE),
  'sigma:defer': () => parseSigmaDefer(SAMPLE),
  parjs: () => parseParjs(SAMPLE)
} as any

function selectBenchmark() {
  for (const name in benchmarks) {
    for (const arg of process.argv) {
      if (arg === name) {
        return add(name, benchmarks[name])
      }
    }
  }

  throw new Error('no benchmark selected')
}

suite(
  'JSON :: sigma vs parjs',

  selectBenchmark(),

  ...handlers
)
