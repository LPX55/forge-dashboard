import { useEffect, useState, Suspense, startTransition } from 'react';
import { Divider, Group, Paper, SimpleGrid, Text } from '@mantine/core';
import { Sparklines, SparklinesLine, SparklinesBars, SparklinesCurve } from 'react-sparklines';
import { formatToken, formatUSD } from '../utils/currency';
import { SWRConfig } from "swr";

import {
  IconUserPlus,
  IconUsers,
  IconWaveSawTool,
  IconCoin,
  IconArrowUpRight,
  IconArrowDownRight,
  IconBuildingBank
} from '@tabler/icons-react';
import classes from './StatsGrid.module.css';

const icons = {
  volume: IconWaveSawTool,
  users: IconUsers,
  tvl: IconBuildingBank,
  coin: IconCoin,
};
type DataMapType = {
  key: number;
  title: string;
  icon: string;
  value: string;
  diff: string;
  tf: string;
  sparkData: number[];
  secondTitle: string;
  secondValue: string;
}[];

type TVLDataType = {
  currentChainTvls: {
    Evmos: number;
  };
  tvl: {
    date: number;
    totalLiquidityUSD: number;
  }[];
};
type VolDataType = {
  total24h: number;
  total14dto7d: number;
  totalAllTime: number;
  totalDataChart: any[]; // Replace 'any' with the actual type of the elements in totalDataChart
  // Add other properties as needed
};
type ChainDataType = {
  date: number;
  tvl: number;
}[];
import { useChainTVL, useTVL, useVol } from '../lib/use-SWR'
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';


export function StatsGrid(fallback) {
  const initMap = [
    { key: 1, title: 'Forge TVL (USD)', icon: 'tvl', value: '940,055', diff: '10', tf: 'month', sparkData: [0, 2, 4], secondTitle: 'EVMOS NETWORK TVL', secondValue: '' },
    { key: 2, title: 'Transaction Volume', icon: 'volume', value: '4,145', diff: '13', tf: 'week', sparkData: [2, 4, 6], secondTitle: 'VOLUME TO DATE', secondValue: '' },
    { key: 3, title: 'Daily Active Addresses', icon: 'users', value: '745', diff: '18', tf: 'week', sparkData: [2, 1, 5], secondTitle: '', secondValue: '' },
  ]
  const [dataMap, setDataMap] = useState<DataMapType>(initMap);
  const [TVLData, setTVLData] = useState<TVLDataType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [VolData, setVolData] = useState<VolDataType | null>(null);
  const [isVolLoading, setIsVolLoading] = useState(true);
  const [ChainData, setChainData] = useState<ChainDataType | null>(null);
  const [isChainLoading, setIsChainLoading] = useState(true);
  const getChange = (oldTVL: number, newTVL: number) => {
    let amtChange = ((newTVL - oldTVL) / oldTVL) * 100;
    let amtChangeAbs = Math.abs(amtChange);
    return newTVL > oldTVL ? amtChangeAbs : -amtChangeAbs;
  }
  const TVLDataResult = useTVL();
  const VolDataResult = useVol();
  const ChainDataResult = useChainTVL();

  useEffect(() => {
    const fetchData = async () => {
      setTVLData(TVLDataResult.TVLData);
      setIsLoading(TVLDataResult.isLoading);
      setVolData(VolDataResult.VolData);
      setIsVolLoading(VolDataResult.isVolLoading);
      setChainData(ChainDataResult.ChainData);
      setIsChainLoading(ChainDataResult.isChainLoading);
    };
    fetchData();
  }, [TVLDataResult, VolDataResult, ChainDataResult]);



  const currentTVL = (!isLoading && TVLData) ? formatUSD(TVLData.currentChainTvls.Evmos) : '';
  const historicalTVL = !isLoading ? TVLData?.tvl.slice(-31).map((entry) => {
    const date = new Date(entry.date * 1000).toLocaleString();
    return {
      date: date,
      tvlUSD: entry.totalLiquidityUSD
    };
  }) : null;

  if (!isLoading && TVLData && historicalTVL) {
    const changeTVL = getChange(historicalTVL[0].tvlUSD, historicalTVL[historicalTVL.length - 1].tvlUSD).toFixed(3)
    dataMap[0].value = currentTVL;
    dataMap[0].diff = changeTVL;
    dataMap[0].sparkData = historicalTVL.map(entry => entry.tvlUSD);
  }
  if (!isVolLoading && VolData) {
    const currentVol = formatUSD(VolData.total24h)
    const historicalVol = VolData.totalDataChart.slice(-31).map((entry) => {
      const date = new Date(entry[0] * 1000).toLocaleString();
      return {
        date: date,
        vol: entry[1]
      };
    });
    const weeklyVol = historicalVol.slice(-7);
    const sumOfVol = weeklyVol.reduce((total, entry) => total + entry.vol, 0);

    const changeVol = getChange(sumOfVol, VolData.total14dto7d).toFixed(3)
    dataMap[1].value = formatUSD(sumOfVol);
    dataMap[1].diff = changeVol;
    dataMap[1].sparkData = historicalVol.map(entry => entry.vol);
    dataMap[1].secondValue = formatUSD(VolData.totalAllTime);
  }
  if (!isChainLoading && ChainData) {
    const currentChainTVL = formatUSD(ChainData[ChainData.length - 1].tvl)
    dataMap[0].secondValue = currentChainTVL;

    const historicalChainTVL = ChainData.slice(-90).map((entry) => {
      const date = new Date(entry.date * 1000).toLocaleString();
      return {
        date: date,
        tvl: entry.tvl
      };
    });
  }
  function ErrorFallback() {
    return <div>loading...</div>;
  }
  const stats = dataMap.map((stat) => {
    const Icon = icons[stat.icon];
    const DiffIcon = Number(stat.diff) > 0 ? IconArrowUpRight : IconArrowDownRight;
    return (
      <ErrorBoundary errorComponent={ErrorFallback}>
        <Suspense fallback={<div>loading...</div>}>
          <SWRConfig value={{ fallback }}>
            <Paper withBorder p="md" radius="md" key={stat.title}>
              <Group justify="space-between">
                <Text size="xs" c="dimmed" className={classes.title}>
                  {stat.title}
                </Text>
                <Icon className={classes.icon} size="1.4rem" stroke={1.5} />
              </Group>
              <Sparklines data={stat.sparkData} limit={31} width={100} height={25} margin={2}>
                <SparklinesCurve color="#5c5f66" />
                {/* {stat.icon == 'tvl' ? (
          <><SparklinesCurve color="#5c5f66" /></>
        ) : stat.icon == 'volume' ? (
          <><SparklinesBars color="#5c5f66" /></>
        ) : 
        <></>
        } */}

              </Sparklines>
              <Group align="flex-end" gap="xs" mt={25}>
                <Text className={classes.value}>{stat.value}</Text>
                <Text c={Number(stat.diff) > 0 ? 'teal' : 'red'} fz="sm" fw={500} className={classes.diff}>
                  <span>{stat.diff}%</span>
                  <DiffIcon size="1rem" stroke={1.5} />
                </Text>
              </Group>

              <Text fz="xs" c="dimmed" mt={7}>
                Compared to previous {stat.tf}
              </Text>
              <Divider my="sm" variant="dotted" />
              <Group justify="space-between">
                <Text size="xs" c="dimmed" className={classes.secondTitle}>
                  {stat.secondTitle}
                </Text>
              </Group>
              <Text className={classes.value}>{stat.secondValue}</Text>
            </Paper>
          </SWRConfig>
        </Suspense>
      </ErrorBoundary>
    );
  });
  return (
    <div className={classes.root}>
      <SimpleGrid cols={{ base: 1, md: 1, xxl: 1 }}>{stats}</SimpleGrid>
    </div>
  );
}
