import { IsoBench } from 'iso-bench'

import { SAMPLE } from './@sample'
import { parse as parseParJS } from './parjs'
import { parse as parseSigmaDefer } from './sigma'
import { parse as parseSigmaGrammar } from './sigma-grammar'

async function run() {
  const bench = new IsoBench('My bench', { ms: 2000, minMs: 100 })

  const tests = await bench
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

  for (const { name, values } of tests) {
    console.log({
      name,
      min: minOf(values),
      mean: meanOf(values),
      typical: weightedMean(values, 10)
    })
  }
}

run()

function weightedMean(values: number[], factor = 10) {
  const buckets = sortIntoBuckets(values, 100)
    .filter((bucket) => bucket.values.length > 0)
    .map((bucket) => ({
      ...bucket,
      weightedAverage: distanceWeightedMean(bucket.values, factor)
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

function meanOf(values: number[]): number {
  let sum = 0

  for (const value of values) {
    sum += value
  }

  return sum / values.length
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

function distanceWeightedMean(values: number[], factor = 2): number {
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
