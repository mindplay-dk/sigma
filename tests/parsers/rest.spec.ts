import { sequence } from '@lib/combinators/sequence'
import { string } from '@lib/parsers/string'
import { rest } from '@lib/parsers/rest'

import { result, run, should } from '@tests/@helpers'

describe(rest, () => {
  it('should succeed with the rest of input', () => {
    const parser = sequence(string('start'), rest())
    const actual = run(parser, 'startend')
    const expected = result(true, ['start', 'end'])

    should.matchState(actual, expected)
  })

  it('should succeed with empty string if no input left to consume', () => {
    const parser = sequence(string('start'), rest())
    const actual = run(parser, 'start')
    const expected = result(true, ['start', ''])

    should.matchState(actual, expected)
  })
})
