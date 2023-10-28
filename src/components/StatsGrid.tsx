import { Divider, Group, Paper, SimpleGrid, Text } from '@mantine/core';
import { Sparklines, SparklinesLine, SparklinesBars, SparklinesCurve } from 'react-sparklines';
import { formatToken, formatUSD } from '../lib/currency';

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
import useSWR, { SWRConfig } from "swr";
import { useChainTVL, useTVL, useVol } from './../lib/useSWR'

export function StatsGrid(fallback) {
  let dataMap = [
    { key: 1, title: 'Forge TVL (USD)', icon: 'tvl', value: '940,055', diff: '10', tf: 'month', sparkData: [0,2,4], secondTitle: 'EVMOS NETWORK TVL', secondValue: '' },
    { key: 2, title: 'Transaction Volume', icon: 'volume', value: '4,145', diff: '13', tf: 'week', sparkData: [2,4,6], secondTitle: 'VOLUME TO DATE', secondValue: '' },
    { key: 3, title: 'Daily Active Addresses', icon: 'users', value: '745', diff: '18', tf: 'week', sparkData: [2,1,5], secondTitle: '', secondValue: '' },
  ]
  const { TVLData, isLoading } = useTVL()
  const { VolData, isVolLoading } = useVol()
  const { ChainData, isChainLoading } = useChainTVL()
  const getChange = (oldTVL: number, newTVL: number) => {
    let amtChange = ((newTVL - oldTVL) / oldTVL) * 100;
    let amtChangeAbs = Math.abs(amtChange);
    return newTVL > oldTVL ? amtChangeAbs : -amtChangeAbs;
  }
  const currentTVL = !isLoading ? formatUSD(TVLData.currentChainTvls.Evmos) : null;
  const historicalTVL = !isLoading ? TVLData.tvl.slice(-31).map((entry) => {
    const date = new Date(entry.date * 1000).toLocaleString();
    return {
      date: date,
      tvlUSD: entry.totalLiquidityUSD
    };
  }) : null;

  if (!isLoading) {
    const changeTVL = getChange(historicalTVL[0].tvlUSD, historicalTVL[historicalTVL.length-1].tvlUSD).toFixed(3)
    dataMap[0].value = currentTVL;
    dataMap[0].diff = changeTVL;
    dataMap[0].sparkData = historicalTVL.map(entry => entry.tvlUSD);
  }
  if (!isVolLoading) {
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
    console.log(ChainData);

    const changeVol = getChange(sumOfVol, VolData.total14dto7d).toFixed(3)
    console.log(historicalVol)
    dataMap[1].value = formatUSD(sumOfVol);
    dataMap[1].diff = changeVol;
    dataMap[1].sparkData = historicalVol.map(entry => entry.vol);
    dataMap[1].secondValue = formatUSD(VolData.totalAllTime);
  }
  if (!isChainLoading){
    const currentChainTVL = formatUSD(ChainData[ChainData.length - 1].tvl)
    dataMap[0].secondValue = currentChainTVL;

    const historicalChainTVL = ChainData.slice(-90).map((entry) => {
      const date = new Date(entry.date * 1000).toLocaleString();
      return {
        date: date,
        tvl: entry.tvl
      };
    });
    console.log(VolData)
  }
  const stats = dataMap.map((stat) => {
    const Icon = icons[stat.icon];
    const DiffIcon = Number(stat.diff) > 0 ? IconArrowUpRight : IconArrowDownRight;
    return (
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
    );
  });
  return (
    <div className={classes.root}>
      <SimpleGrid cols={{ base: 1, md: 1, xxl: 1 }}>{stats}</SimpleGrid>
    </div>
  );
}
