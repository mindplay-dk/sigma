import { IsoBench } from 'iso-bench'

import { SAMPLE } from './@sample'
import { parse as parseParJS } from './parjs'
import { parse as parseSigmaDefer } from './sigma'
import { parse as parseSigmaGrammar } from './sigma-grammar'

async function run() {
  const bench = new IsoBench('My bench', { minMs: 2000 })

  await bench
    .add('parseSigmaDefer', () => {
      parseSigmaDefer(SAMPLE)
    })
    .add('parseSigmaGrammar', () => {
      parseSigmaGrammar(SAMPLE)
    })
    .add('parseParJS', () => {
      parseParJS(SAMPLE)
    })
    .run()
}

run()
