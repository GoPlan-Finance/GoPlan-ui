import {PriceHistoryItem} from '../../../interfaces/ApplicationInterfaces'
import {PriceAdapterInterface} from '../../AdapterInterfaces'

interface TiingoApiMetaResponse {
    endDate: string,
    ticker: string,
    name: string,
    description: string,
    exchangeCode: string,
    startDate: string,
}

interface TiingoApiPriceResponse {
    date: Date;
    close: number;
    high: number;
    low: number;
    open: number;
    volume: number;
    adjClose: number;
    adjHigh: number;
    adjLow: number;
    adjOpen: number;
    adjVolume: number;
    divCash: number;
    splitFactor: number;
}

export class TiingoApiAdapter implements PriceAdapterInterface {

  async loadPricesFromApi (ticker: string): Promise<TiingoApiPriceResponse[]> {
    console.log(ticker)
    const response = await fetch('./tiingo/prices.json')
    return response.json()
  }

  resolvePriceApiResponse (json: TiingoApiPriceResponse[]): PriceHistoryItem[] {
    const priceHistoryItems: PriceHistoryItem[] = []

    json.forEach(item => {
      const priceHistoryItem: PriceHistoryItem = {
        close       : item.close,
        date        : item.date,
        divCash     : item.divCash,
        high        : item.high,
        low         : item.low,
        open        : item.open,
        splitFactor : item.splitFactor,
        volume      : item.volume
      }
      priceHistoryItems.push(priceHistoryItem)
    })

    return priceHistoryItems
  }

  async loadMetaFromApi (ticker: string): Promise<TiingoApiMetaResponse[]> {
    console.log(ticker)
    const response = await fetch('./tiingo/prices.json')
    return response.json()
  }

  resolveMetaApiResponse (json: TiingoApiMetaResponse[]): PriceHistoryItem[] {
    const priceHistoryItems: PriceHistoryItem[] = []

    json.forEach(item => {
      const priceHistoryItem: PriceHistoryItem = {
        close       : item.close,
        date        : item.date,
        divCash     : item.divCash,
        high        : item.high,
        low         : item.low,
        open        : item.open,
        splitFactor : item.splitFactor,
        volume      : item.volume
      }
      priceHistoryItems.push(priceHistoryItem)
    })

    return priceHistoryItems
  }

}
