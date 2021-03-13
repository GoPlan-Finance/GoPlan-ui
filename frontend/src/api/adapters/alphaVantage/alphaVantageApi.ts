import {CompanyDetails, PriceHistoryItem} from '../../../interfaces/ApplicationInterfaces'

export interface AlphaVantageCompanyOverview {
    'Symbol': string;
    'AssetType': string;
    'Name': string;
    'Description': string;
    'Exchange': string;
    'Currency': string;
    'Country': string;
    'Sector': string;
    'Industry': string;
    'Address': string;
    'FullTimeEmployees': string;
    'FiscalYearEnd': string;
    'LatestQuarter': string;
    'MarketCapitalization': string;
    'EBITDA': string;
    'PERatio': string;
    'PEGRatio': string;
    'BookValue': string;
    'DividendPerShare': string;
    'DividendYield': string;
    'EPS': string;
    'RevenuePerShareTTM': string;
    'ProfitMargin': string;
    'OperatingMarginTTM': string;
    'ReturnOnAssetsTTM': string;
    'ReturnOnEquityTTM': string;
    'RevenueTTM': string;
    'GrossProfitTTM': string;
    'DilutedEPSTTM': string;
    'QuarterlyEarningsGrowthYOY': string;
    'QuarterlyRevenueGrowthYOY': string;
    'AnalystTargetPrice': string;
    'TrailingPE': string;
    'ForwardPE': string;
    'PriceToSalesRatioTTM': string;
    'PriceToBookRatio': string;
    'EVToRevenue': string;
    'EVToEBITDA': string;
    'Beta': string;
    '52WeekHigh': string;
    '52WeekLow': string;
    '50DayMovingAverage': string;
    '200DayMovingAverage': string;
    'SharesOutstanding': string;
    'SharesFloat': string;
    'SharesShort': string;
    'SharesShortPriorMonth': string;
    'ShortRatio': string;
    'ShortPercentOutstanding': string;
    'ShortPercentFloat': string;
    'PercentInsiders': string;
    'PercentInstitutions': string;
    'ForwardAnnualDividendRate': string;
    'ForwardAnnualDividendYield': string;
    'PayoutRatio': string;
    'DividendDate': string;
    'ExDividendDate': string;
    'LastSplitFactor': string;
    'LastSplitDate': string;
}

export interface AVmetaData {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Output Size': string;
    '5. Time Zone': string;
}

export interface AlphaVantagePrice {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. adjusted close': string;
    '6. volume': string;
    '7. dividend amount': string;
    '8. split coefficient': string;
}

export interface AlphaVantageApiDaily {
    'Meta Data': AVmetaData;
    'Time Series (Daily)': Record<string, AlphaVantagePrice>;
}


export class AlphaVantageApiAdapter {

  async loadCompanyInformationFromApi (ticker: string): Promise<AlphaVantageCompanyOverview> {
    const url = new URL('https://www.alphavantage.co/query')
    url.searchParams.append('function', 'OVERVIEW')
    url.searchParams.append('symbol', ticker)
    url.searchParams.append('apikey', '070Y83J1TYI2KAGU')

    const response = await fetch(url.toString())
    return response.json()
  }

  resolveCompanyDetailsApiResponse (json: AlphaVantageCompanyOverview): CompanyDetails {
    return {
        _200dayMovingAverage: json['200DayMovingAverage'],
        _50dayMovingAverage: json['50DayMovingAverage'],
        _52weekHigh: json['52WeekHigh'],
        _52weekLow: json['52WeekLow'],
        address: json.Address,
        analystTargetPrice: json.AnalystTargetPrice,
        assetType: json.AssetType,
        beta: json.Beta,
        bookValue: json.BookValue,
        country: json.Country,
        currency: json.Currency,
        description: json.Description,
        dilutedEpsttm: json.DilutedEPSTTM,
        dividendDate: json.DividendDate,
        dividendPerShare: json.DividendPerShare,
        dividendYield: json.DividendYield,
        ebitda: json.EBITDA,
        eps: json.EPS,
        evToEbitda: json.EVToEBITDA,
        evToRevenue: json.EVToRevenue,
        exDividendDate: json.ExDividendDate,
        exchange: json.Exchange,
        fiscalYearEnd: json.FiscalYearEnd,
        forwardAnnualDividendRate: json.ForwardAnnualDividendRate,
        forwardAnnualDividendYield: json.ForwardAnnualDividendYield,
        forwardPe: json.ForwardPE,
        fullTimeEmployees: json.FullTimeEmployees,
        grossProfitTtm: json.GrossProfitTTM,
        industry: json.Industry,
        lastSplitDate: json.LastSplitDate,
        lastSplitFactor: json.LastSplitFactor,
        latestQuarter: json.LatestQuarter,
        marketCapitalization: json.MarketCapitalization,
        name: json.Name,
        operatingMarginTtm: json.OperatingMarginTTM,
        payoutRatio: json.PayoutRatio,
        peRatio: json.PERatio,
        pegRatio: json.PEGRatio,
        percentInsiders: json.PercentInsiders,
        percentInstitutions: json.PercentInstitutions,
        priceToBookRatio: json.PriceToBookRatio,
        priceToSalesRatioTtm: json.PriceToSalesRatioTTM,
        profitMargin: json.ProfitMargin,
        quarterlyEarningsGrowthYoy: json.QuarterlyEarningsGrowthYOY,
        quarterlyRevenueGrowthYoy: json.QuarterlyRevenueGrowthYOY,
        returnOnAssetsTtm: json.ReturnOnAssetsTTM,
        returnOnEquityTtm: json.ReturnOnEquityTTM,
        revenuePerShareTtm: json.RevenuePerShareTTM,
        revenueTtm: json.RevenueTTM,
        sector: json.Sector,
        sharesFloat: json.SharesFloat,
        sharesOutstanding: json.SharesOutstanding,
        sharesShort: json.SharesShort,
        sharesShortPriorMonth: json.SharesShortPriorMonth,
        shortPercentFloat: json.ShortPercentFloat,
        shortPercentOutstanding: json.ShortPercentOutstanding,
        shortRatio: json.ShortRatio,
        symbol: json.Symbol,
        trailingPe:json.TrailingPE
    }
  }

}
