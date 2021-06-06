/**
 *
 *
 *
 */
import { HoldingTimeSeries } from '/@common/models'
import { Query } from '/@common/Query'
import { ArrayUtils } from '/@common/utils'
import * as dayjs from 'dayjs'
import * as duration from 'dayjs/plugin/duration'


export type CandleData = { date : dayjs.Dayjs | undefined; open : any; high : any; low : any; close : any; volume : any }

dayjs.extend(duration)


export interface TimeScaleInterface {
  label : string
  visible : duration.Duration
  resolution : string  // @todo use Backend Type.Resoulution
}


// interface TimeRange {
//     min: number
//     max: number
// }

export const timeScales : TimeScaleInterface[] = [
  // {
  //     label: 'Hour',
  //     visible: dayjs.duration(1, 'hour'),
  //     resolution: 'minute',
  // },
  {
    label      : 'Today',
    visible    : dayjs.duration(1, 'day'),
    resolution : '1minute',
  },
  {
    label      : 'Week',
    visible    : dayjs.duration(7, 'day'),
    resolution : '15minutes',
  },
  {
    label      : 'Month',
    visible    : dayjs.duration(30, 'day'),
    resolution : 'hour',
  },
  {
    label      : '3 M',
    visible    : dayjs.duration(3, 'month'),
    resolution : 'hour',
  },
  {
    label      : '1 Y',
    visible    : dayjs.duration(1, 'year'),
    resolution : 'day',
  },
  {
    label      : '3 Y',
    visible    : dayjs.duration(3, 'year'),
    resolution : 'week',
  },
  {
    label      : '10 Y',
    visible    : dayjs.duration(10, 'year'),
    resolution : 'week',
    //resolution : 'month',
  },
  {
    label      : 'All Time',
    visible    : dayjs.duration(1000, 'year'),
    resolution : 'week',
    //resolution : 'month',
  },
]

export const getScaleForRange = (min : dayjs.Dayjs, max : dayjs.Dayjs) : TimeScaleInterface => {
  const delta = dayjs.duration(max.diff(min))

  const scale = timeScales.find(s => delta.asMilliseconds() < s.visible.asMilliseconds())

  if (!scale) {
    throw 'Invalid scale'
  }

  return scale
}

export const getScaleByLabel = (label : string) : TimeScaleInterface => {
  const scale = timeScales.find(s => label === s.label)

  if (!scale) {
    throw `Invalid scale "${label}"`
  }

  return scale
}


export const loadData = async () : Promise<unknown> => {


  const q = Query.create(HoldingTimeSeries)
  q.equalTo('period', 'day')
  q.ascending('startAt')
  q.include('holding')
  q.include('holding.symbol')

  q.limit(9999999)
  const holdingTimeSeries = await q.find()

  const dates = ArrayUtils.unique(holdingTimeSeries.map(timeSeries => dayjs(timeSeries.startAt).format('YYYY-MM-DD')))

  const series = []

  for (const timeSeries of holdingTimeSeries) {

    if (!series[timeSeries.holding.symbolName]) {
      series[timeSeries.holding.symbolName] = ArrayUtils.fill(dates.length, 0)
    }
    const dt    = dayjs(timeSeries.startAt).format('YYYY-MM-DD')
    const index = dates.indexOf(dt)

    if (index === -1) {
      continue // @todo throw
    }

    series[timeSeries.holding.symbolName][index] = (timeSeries.open + timeSeries.close) / 2
  }

  return {
    symbols: Object.keys(series),
    series,
    dates,
  }
}


export const makeSeries = async () : Promise<unknown> => {

  const {series, dates, symbols} = await loadData()
  const chartSeries              = []

  for (const [
    symbol, data
  ] of Object.entries(series)) {

    chartSeries.push({
      barWidth  : 15,
      name      : symbol,
      type      : 'bar',
      stack     : 'holdings',
      areaStyle : {},
      emphasis  : {
        focus: 'series',
      },
      data,
    })
  }


  return {
    series : chartSeries,
    dates,
    legend : symbols}
}
