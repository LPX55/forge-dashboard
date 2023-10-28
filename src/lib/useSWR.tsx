import { useState } from 'react'
import useSWR from 'swr'
 
const fetcher = (url) => fetch(url).then((res) => res.json());
 
export function useTVL() {
    const TVL_API = "https://api.llama.fi/protocol/forge"
    const { data, error, isLoading } = useSWR(TVL_API, fetcher, { refreshInterval: 30000 })
    return {
        TVLData: data,
        isLoading,
        isError: error
    }
    } 

export function useVol() {
    const VOL_API = "https://api.llama.fi/summary/dexs/forge?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true&dataType=dailyVolume"
    const { data, error, isLoading } = useSWR(VOL_API, fetcher, { refreshInterval: 20000 })
    return {
        VolData: data,
        isVolLoading: isLoading,
        isError: error
    }
    }

export function useChainTVL(){
    const CHAIN_API = "https://api.llama.fi/v2/historicalChainTvl/evmos"
    const { data, error, isLoading } = useSWR(CHAIN_API, fetcher, { refreshInterval: 60000 })
    return {
        ChainData: data,
        isChainLoading: isLoading,
        isError: error
    }
    
}