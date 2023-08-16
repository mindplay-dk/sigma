import { IsoBench } from 'iso-bench'

import { SAMPLE } from './@sample'
// import { parse as parseParjs } from './parjs'
import { parse as parseSigmaDefer } from './sigma'
// import { parse as parseSigmaGrammar } from './sigma-grammar'
;(async () => {
  const scope = new IsoBench.Scope({ minMs: 2000 }, (SAMPLE) => [parseSigmaDefer, SAMPLE], SAMPLE)

  await scope
    .add('parseSigmaDefer', (parseSigmaDefer, SAMPLE) => {
      parseSigmaDefer(SAMPLE)
    })
    .result()
    .run()
})()
