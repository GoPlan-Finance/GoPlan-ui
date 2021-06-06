import { Currencies } from 'ts-money'
import NumberFormatOptions = Intl.NumberFormatOptions


export function sleep (ms : number) : Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export type StringKeys<T> = Extract<keyof T, string>;


export const processBatch = async <T, U = void> (
  data : Array<T>,
  func : (elem : T) => U | Promise<U>,
  statusFunc : (curIndex : number, len : number, result : U) => (boolean | undefined | null | Promise<void> | Promise<boolean>) = null,
  nbParallel = 8,
) : Promise<U[]> => {

  const results : Array<U> = []
  let index                = 0
  let iCompleted           = 0
  let abortAll             = false

  const runOne = async (curIndex : number) => {
    let result : U | null = null
    try {
      result = await func(data[curIndex])
    } catch (error) {
      console.error(error)
      result = error
    }
    const statusResult = statusFunc ? await statusFunc(curIndex, data.length, result) : true

    if (statusResult === false) {
      console.warn('Abort "signal" received')
      abortAll = true
    }

    results.push(result)

    ++iCompleted
  }

  const runLoop = async () : Promise<void> => {
    while (!abortAll
           && iCompleted < data.length
           && index < data.length) {

      const curIndex = index++

      await sleep(0)
      await runOne(curIndex)
    }
  }

  // start first iteration
  const threads : Promise<void>[] = []
  while (--nbParallel >= 0) {
    threads.push(runLoop())
  }

  await Promise.all(threads)

  return results
}


export class MathUtils {

  static between (i : number, min : number, max : number) : number {
    return Math.max(min, Math.min(i, max))
  }

}


export function hideZero (num : number) : string {
  return num === 0 ? '' : num.toString()
}

export function padDecimals (num : number, minDec = 0, maxDec = 4) : string {

  // decimal part, without trailing 00
  // 1.000 ->  ''
  // 1.12345000 ->  12345
  // 1.12000 -> 12
  const str = num.toFixed(maxDec).toString()

  const dec = str.includes('.') ? str.split('.')[1].replace(/0+$/, '') : ''

  const len = dec.length <= minDec ? minDec : maxDec

  return Number(num).toFixed(len)
}


interface CurrencyInfoInterface {
  decimal_digits : number
  symbol : string
}


export const getCurrencyInfo = (currency : string | null) : CurrencyInfoInterface => {

  const info = {
    decimal_digits : 2,
    symbol         : '$',
  }

  if (!currency) {
    return info
  }

  currency = currency.toUpperCase()

  if (!Currencies[currency as keyof typeof Currencies]) {
    throw `Currency not found ${currency}`
  }

  return Currencies[currency.toUpperCase() as keyof typeof Currencies]
}


export const formatCurrency = (value : number, currency : string, fixedDecimals = true, locale = 'en-US', signDisplay = 'auto') : string => {

  if (value === null || value === undefined) {
    return ''
  }

  if (!isNaN(Number(value))) {
    value = Number(value)
  }

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#parameters
  const options: NumberFormatOptions = {
    style                 : 'currency',
    currency,
    minimumFractionDigits : 0,
    maximumFractionDigits : 4,
    signDisplay
  }

  if (fixedDecimals) {
    options.minimumFractionDigits = 2
  }

  return new Intl.NumberFormat(locale, options).format(value)
}

type groupByFn<T> = (value : T, index : number) => string
type groupByResult<T> = { [key : string] : T[] }


export class ArrayUtils {

  public static groupBy<T> (array : T[], keyCb : groupByFn<T>) : groupByResult<T> {

    return array.reduce((result : groupByResult<T>, currentValue, index) => {

      const key : string = keyCb(currentValue as T, index)

      result[key] = result[key] || []

      result[key].push(
        currentValue,
      )
      return result
    }, {})
  }

  public static batches<T> (array : T[], perChunk : number) : T[][] {

    return Object.values(ArrayUtils.groupBy<T>(array, (value, index) => {

      return Math.floor(index / perChunk).toString()

    }))
  }


  public static unique<T> (array : T[]) : T[] {
    return array.filter((value, index, self) => {
      return self.indexOf(value) === index
    })
  }

  public static fill<T> (len :number, value: T) {
    return (new Array(len)).fill(value)
  }

  public static sum<T> (arr  : T [], cb : (item : T) => number) : number {
    return arr.reduce((result, current) => result + cb(current), 0)
  }

}


export class StringUtils {

  static toNumberOrNull (value : string) : number | null {
    const floatVal = parseFloat(value)

    if (isNaN(floatVal)) {
      return null
    }

    return floatVal
  }


}


