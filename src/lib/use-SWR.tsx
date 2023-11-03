import { Suspense } from 'react'
import useSWR from 'swr'

const fetcher = (url) => fetch(url).then((res) => res.json());
export async function getFallbackData() {
    const initMap = [
      { key: 1, title: 'Forge TVL (USD)', icon: 'tvl', value: '940,055', diff: '10', tf: 'month', sparkData: [0,2,4], secondTitle: 'EVMOS NETWORK TVL', secondValue: '' },
      { key: 2, title: 'Transaction Volume', icon: 'volume', value: '4,145', diff: '13', tf: 'week', sparkData: [2,4,6], secondTitle: 'VOLUME TO DATE', secondValue: '' },
      { key: 3, title: 'Daily Active Addresses', icon: 'users', value: '745', diff: '18', tf: 'week', sparkData: [2,1,5], secondTitle: '', secondValue: '' },
    ]
    return initMap; // fetchFallbackData is a function that fetches your data
  }
  
export function useTVL() {
    const TVL_API = "https://api.llama.fi/protocol/forge"
    const { data, error, isValidating } = useSWR(TVL_API, fetcher, { suspense: true, refreshInterval: 30000, fallbackData: getFallbackData() })
    return {
        TVLData: data,
        isLoading: isValidating,
        isError: error
    }
}
export function useVol() {
    const VOL_API = "https://api.llama.fi/summary/dexs/forge?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true&dataType=dailyVolume"
    const { data, error, isLoading } = useSWR(VOL_API, fetcher, { suspense: true, refreshInterval: 20000, fallbackData: getFallbackData() })
    return {
        VolData: data,
        isVolLoading: isLoading,
        isError: error
    }
    }

export function useChainTVL(){
    const CHAIN_API = "https://api.llama.fi/v2/historicalChainTvl/evmos"
    const { data, error, isLoading } = useSWR(CHAIN_API, fetcher, { suspense: true, refreshInterval: 60000, fallbackData: getFallbackData() })
    return {
        ChainData: data,
        isChainLoading: isLoading,
        isError: error
    }
    
}