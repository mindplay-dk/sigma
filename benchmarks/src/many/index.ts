import { IsoBench } from 'iso-bench'

import { SAMPLE } from './@sample'
import { parse as parseParjs } from './parjs'
import { parse as parseSigma } from './sigma'

async function run() {
  const bench = new IsoBench('My bench', { minMs: 2000 })

  await bench
    .add('sigma', () => {
      parseSigma(SAMPLE)
    })
    .add('parjs', () => {
      parseParjs(SAMPLE)
    })
    .run()
}

run()
