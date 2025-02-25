import { string, defer } from '@parsers'
import { run, result, should, testFailure, describe, it } from '@testing'

describe('defer', () => {
  it('should succeed if the deferred parser is not set', () => {
    const deferred = defer<string>()

    deferred.with(string('deferred'))

    const actual = run(deferred, 'deferred')
    const expected = result(true, 'deferred')

    should.matchState(actual, expected)
  })

  it('should throw if the deferred parser is not set', () => {
    testFailure('deferred', defer<string>())
  })

  it('should fail if the deferred parser fails', () => {
    const deferred = defer<string>()

    deferred.with(string('deferred'))

    const actual = run(deferred, 'lazy')
    const expected = result(false, 'deferred')

    should.matchState(actual, expected)
  })
})
