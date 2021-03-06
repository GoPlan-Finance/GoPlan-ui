import {TiingoApiPriceResponse} from "./tiingo-price-interface";

export default async function getPrices(): Promise<TiingoApiPriceResponse> {
    let response = await fetch("./tiingo.json");
    return response.json() as Promise<TiingoApiPriceResponse>;
}