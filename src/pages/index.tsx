import { useState } from 'react';
import { NextPage } from 'next';
import { Swaps } from '../components/Swaps';
import { Grid, Center, Stack, Tabs, Title, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { Pools } from '../components/Pools';
import { Tokens } from '../components/Tokens';
import { StatsGrid } from '../components/StatsGrid'
import '@mantine/core/styles.css';
import classes from './index.module.css';

enum Tab {
  POOLS = "pools",
  SWAPS = "swaps",
  TOKENS = "tokens",
  REFRESH = "refresh"
}

const IndexPage: NextPage = () => {
  const [activeTab, setActiveTab] = useState<string | null>('tokens');


  return (
    <Grid>
    <Grid.Col span="auto" p="md" className={classes.navbar}>
      <StatsGrid></StatsGrid>
    </Grid.Col>
    <Grid.Col p="md" span={9} className={classes.main}>
      <Stack align="left" justify="stretch" gap="lg" className={classes.stack}>
          <Tabs color="rgba(237, 78, 51, 1)" variant="pills" defaultValue={Tab.TOKENS} value={activeTab} onChange={setActiveTab} classNames={classes}>
              <Tabs.List>
                <Tabs.Tab value={Tab.TOKENS}>Tokens</Tabs.Tab>
                <Tabs.Tab value={Tab.SWAPS}>Swaps</Tabs.Tab>
                <Tabs.Tab value={Tab.REFRESH} ml="auto" p="0" display={'block'} className="refreshTab"></Tabs.Tab>
              </Tabs.List>

            <Tabs.Panel value={Tab.SWAPS}><Swaps /></Tabs.Panel>
            <Tabs.Panel value={Tab.TOKENS}><Tokens /></Tabs.Panel>
          </Tabs>
    </Stack>
    </Grid.Col>
  </Grid>

  );
};

export default IndexPage;



