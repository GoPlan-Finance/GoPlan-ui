/**
 *
 *
 *
 */
import * as dayjs from 'dayjs'
import * as duration from 'dayjs/plugin/duration'
import {AssetSymbol} from "../../../../common/models";

export type CandlestickSeries = {
    x: Date,
    y: [open: number, high: number, low: number, close: number]
}


dayjs.extend(duration)

export interface TimeScaleInterface {

    label: string
    visible: duration.Duration
    resolution: string
}


interface TimeRange {
    min: number
    max: number
}


export const timeScales: TimeScaleInterface[] = [
    {
        label: 'Hour',
        visible: dayjs.duration(1, 'hour'),
        resolution: 'minute',
    },
    {
        label: 'Today',
        visible: dayjs.duration(1, 'day'),
        resolution: 'minute',
    },
    {
        label: 'Week',
        visible: dayjs.duration(7, 'day'),
        resolution: 'hour',
    },
    {
        label: 'Month',
        visible: dayjs.duration(30, 'day'),
        resolution: 'hour',
    },
    {
        label: '3 Months',
        visible: dayjs.duration(3, 'month'),
        resolution: 'hour',
    },
    {
        label: '1 yr',
        visible: dayjs.duration(1, 'year'),
        resolution: 'day',
    },
    {
        label: '3 yr',
        visible: dayjs.duration(3, 'year'),
        resolution: 'day',
    },
    {
        label: '10 yr',
        visible: dayjs.duration(10, 'year'),
        resolution: 'week',
    },
    {
        label: 'All Time',
        visible: dayjs.duration(1000, 'year'),
        resolution: 'month',
    },
]

export const getScaleForRange = ({min, max}: TimeRange): TimeScaleInterface => {
    const delta = dayjs.duration(dayjs(max).diff(dayjs(min)))

    const scale = timeScales.find(s => delta.asMilliseconds() < s.visible.asMilliseconds())

    if (!scale) {
        throw 'Invalid scale'
    }

    return scale
}

export const getScaleByLabel = (label: string): TimeScaleInterface => {
    const scale = timeScales.find(s => label === s.label)

    if (!scale) {
        throw 'Invalid scale'
    }

    return scale
}


export const loadData = async (
    assetSymbol: AssetSymbol,
    currentScale: TimeScaleInterface,
    from: dayjs.Dayjs,
    to: dayjs.Dayjs,
): Promise<CandlestickSeries[]> => {

    console.log('Assets--GetEndOfDay',{
        resolution: currentScale.resolution,
        from: from.toISOString(),
        to: to.toISOString(),
        assetSymbolId: assetSymbol.id
    })

    const eod = await Parse.Cloud.run('Assets--GetEndOfDay', {
        resolution: currentScale.resolution,
        from: from.toISOString(),
        to: to.toISOString(),
        assetSymbolId: assetSymbol.id
    })

    const data = eod.map(elem => {
        return {
            x: new Date(elem.date),
            y: [
                elem.open, elem.open, elem.low, elem.close
            ]
        } as CandlestickSeries
    })

    console.log('Received ', data.length )
   // console.table(data )
    return data
}