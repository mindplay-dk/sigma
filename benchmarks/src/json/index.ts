import util from 'util'

import { SAMPLE } from './@sample'
import { parse as parseParjs } from './parjs'
import { parse as parseSigmaDefer } from './sigma'
import { parse as parseSigmaGrammar } from './sigma-grammar'

const benchmarks = {
  'sigma:defer': () => parseSigmaDefer(SAMPLE),
  'sigma:grammar': () => parseSigmaGrammar(SAMPLE),
  parjs: () => parseParjs(SAMPLE)
} as any

function run() {
  const results = []

  for (const name in benchmarks) {
    results.push({ name, ...bench(benchmarks[name]) })
  }

  console.log(util.inspect(results, undefined, 999))
}

function bench(fn: () => void, minLoops = 20, minStable = 2000) {
  const values: number[] = []

  let time = 0
  let min = Number.POSITIVE_INFINITY

  fn() // warm up

  let stableSince = performance.now()

  while (true) {
    const start = performance.now()

    fn()

    const end = performance.now()

    const elapsed = end - start

    values.push(elapsed)

    time += elapsed

    if (elapsed < min) {
      stableSince = end

      min = elapsed
    } else {
      if (values.length >= minLoops && end - stableSince > minStable) {
        break
      }
    }
  }

  return {
    time,
    min,
    max: maxOf(values),
    average: average(values),
    trimmedMean20: trimmedMean(values, 0.2),
    trimmedMean50: trimmedMean(values, 0.5),
    trimmedMean90: trimmedMean(values, 0.9),
    weightedAverage2: weightedAverage(values, 2),
    weightedAverage4: weightedAverage(values, 4),
    weightedAverage10: weightedAverage(values, 10),
    magicAverage: magicAverage(values)
  }
}

function magicAverage(values: number[], factor = 2) {
  const buckets = sortIntoBuckets(values, 10)
    .filter((bucket) => bucket.values.length > 0)
    .map((bucket) => ({
      ...bucket,
      weightedAverage: weightedAverage(bucket.values, factor)
    }))

  let totalWeight = 0
  let weightedSum = 0

  for (const bucket of buckets) {
    const weight = Math.pow(bucket.values.length, factor)

    totalWeight += weight

    weightedSum += weight * bucket.weightedAverage
  }

  return weightedSum / totalWeight
}

function average(values: number[]): number {
  return sum(values) / values.length
}

function sum(values: number[]): number {
  let sum = 0

  for (const value of values) {
    sum += value
  }

  return sum
}

function minOf(values: number[]): number {
  let min = Number.POSITIVE_INFINITY

  for (const value of values) {
    if (value < min) {
      min = value
    }
  }

  return min
}

function maxOf(values: number[]): number {
  let max = 0

  for (const value of values) {
    if (value > max) {
      max = value
    }
  }

  return max
}

type Bucket = { min: number; max: number; values: number[] }

function sortIntoBuckets(values: number[], numBuckets: number): Bucket[] {
  const min = minOf(values)
  const max = maxOf(values)

  const range = max - min

  const buckets: Bucket[] = []

  for (let i = 0; i < numBuckets; i++) {
    buckets.push({
      min: min + (range * i) / numBuckets,
      max: min + (range * (i + 1)) / numBuckets,
      values: []
    })
  }

  for (const value of values) {
    const index = Math.min(
      Math.floor(((value - min) / range) * numBuckets),
      numBuckets - 1 // note: max of bucket range is inclusive *only* for the last bucket
    )

    buckets[index].values.push(value)
  }

  return buckets
}

function trimmedMean(values: number[], margin: number): number {
  // Sort the values from smallest to largest.
  values.sort((a, b) => a - b)

  const numTrimmed = Math.floor(values.length * margin * 0.5)

  // Get the trimmed values.
  const trimmedValues = values.slice(numTrimmed, values.length - numTrimmed)

  // Calculate the mean of the trimmed values.
  return trimmedValues.reduce((a, b) => a + b, 0) / trimmedValues.length
}

function weightedAverage(values: number[], factor = 2): number {
  if (values.length === 0) {
    throw new Error('cannot computed weighted average of an empty list')
  }

  if (values.length === 1) {
    return values[0]
  }

  if (values.length === 2) {
    return (values[0] + values[1]) * 0.5
  }

  let sum = 0

  for (const value of values) {
    sum += value
  }

  const avg = sum / values.length

  const error = (value: number) => Math.abs(avg - value)

  let deviation = 0

  for (const value of values) {
    deviation = Math.max(error(value), deviation)
  }

  if (deviation === 0) {
    return values[0]
  }

  let totalWeight = 0
  let weightedSum = 0

  for (const value of values) {
    const weight = Math.pow(1 - error(value) / deviation, factor)

    totalWeight += weight

    weightedSum += weight * value
  }

  return weightedSum / totalWeight
}

run()

// for (let i = 0; i < 3; i++) {
//   run()
// }

// console.log(weightedAverage([7, 8, 6, 9, 7, 8, 8, 5, 99]))
// console.log(weightedAverage([7, 8, 9, 8, 8, 8, 8]))
