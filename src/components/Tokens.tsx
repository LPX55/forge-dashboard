import { useMantineTheme, Pagination, Stack, Table, Text, Group, Button, Portal } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { formatUSD } from '../lib/currency';
import { useLazyQuery } from '@apollo/client';
import { TokensDocument, TokensQuery } from '../graphql/queries/tokens.graphql.interface';
import { PaginationContext, usePagination } from '../lib/usePagination';
import { notifyError } from '../lib/notifications';
import { TableSkeleton } from './TableSkeleton';
import { Sparklines, SparklinesLine } from 'react-sparklines';
import '@mantine/core/styles/Table.css';
import classes from './Tokens.module.css';

//TODO env
const PAGE_SIZE: number = 14;

const COLUMNS: string[] = [
    "Token",
    "TVL (USD)",
    "Price (USD)",
    "Volume (USD, 24hr)",
    "Δ Price (USD, 24hr)",
    ""
];

interface Row {
    symbol: string;
    name: string;
    priceUSD: number;
    volumeUSD: number;
    priceUSDChange24Hr: number;
    priceChange24Hr: number;
    totalValueLockedUSD: number;
    priceUSDArray: any;
}

// TODO column-sorted table https://ui.mantine.dev/component/table-sort

export function Tokens() {
    const pagination = usePagination();
    const topTokensContext = useTopTokens(pagination);
    const [showSkeleton, setShowSkeleton] = useState(false);


    useEffect(() => {
        if (topTokensContext.error !== undefined) {
            notifyError(
                "Tokens Issue",
                "We're having trouble loading top tokens. Please refresh in a minute.",
                topTokensContext.error
            );
        }
    }, [topTokensContext.error]);

    const handleRefresh = () => {
        setShowSkeleton(true);
        topTokensContext.refresh();
        setTimeout(() => {
            setShowSkeleton(false);
        }, 1000); // Adjust the duration of the loading animation as needed
    };

    return (
        <>
            {topTokensContext.loading && (
                <TableSkeleton columns={COLUMNS} rows={PAGE_SIZE} data-testid="loading" />
            )}
            {!topTokensContext.loading && (
            
        <Stack align='left'>

            <Table>
                <Table.Thead>
                    <Table.Tr>
                        {COLUMNS.map(c => <Table.Th align='left' key={c}>{c}</Table.Th>)}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{topTokensContext.data?.map((row, i) => (
                    <Table.Tr key={`${row.symbol}-${row.name}-${i}`}>
                        <Table.Td>{`${row.name}`} <Text fw="600" span inline>{`(${row.symbol})`}</Text></Table.Td>
                        <Table.Td>{formatUSD(row.totalValueLockedUSD)}</Table.Td>
                        <Table.Td>{formatUSD(row.priceUSD)}</Table.Td>
                        <Table.Td>{formatUSD(row.volumeUSD)}</Table.Td>
                        <Table.Td display="table-cell"><PriceDelta changeUSD={row.priceUSDChange24Hr} />
                        <Text fw="500" fz="xs" ml="8px" span inline>{Math.abs(row.priceChange24Hr).toFixed(2)}%</Text></Table.Td>
                        <Table.Td>
                        <Sparklines data={row.priceUSDArray} limit={14} width={140} height={30} margin={4}  preserveAspectRatio="xMidYMid" svgHeight={40}>
                            <SparklinesLine color="#c1c2c5" />
                        </Sparklines>
                        </Table.Td>

                    </Table.Tr>
                ))}</Table.Tbody>
                    <Portal target=".refreshTab">
                        <Button color="rgba(237, 78, 51, 1)" onClick={handleRefresh}>⟳</Button>
                    </Portal>
            </Table>
        </Stack>
        )}
        </>
    );
}


function PriceDelta(props: { changeUSD: number }): JSX.Element {

    const changeSymbol: string = useMemo(() => {
        if (props.changeUSD < 0) return "🡮";
        else if (props.changeUSD === 0) return "➜";
        else return "🡭";
    }, [props.changeUSD]);

    const styleClass: string | undefined = useMemo(() => {
        if (props.changeUSD < 0) return 'priceDeltaDown';
        else if (props.changeUSD === 0) return undefined;
        else return 'priceDeltaUp';
    }, [props.changeUSD, classes]);

    return <Text c={props.changeUSD >= 0 ? 'teal' : 'red'} fz="sm" fw={500} className={classes.diff}>{changeSymbol} {(formatUSD(Math.abs(props.changeUSD)))}</Text>


}



interface UseRecentTokensContext {
    data: Row[] | undefined;
    loading: boolean;
    error: Error | undefined;
    refresh: () => void;
}


function useTopTokens(pagination: PaginationContext): UseRecentTokensContext {
    const [query, context] = useLazyQuery(TokensDocument, {
        variables: {
            first: PAGE_SIZE,
        }
    });

    // initial load and page change
    useEffect(() => {
        query({ variables: { skip: PAGE_SIZE * pagination.index } });
    }, [pagination.index]);

    const removeToken = ['PEPMOS', 'TOKEN2', 'TOKEN3'];
    const data: UseRecentTokensContext["data"] = useMemo(() => transformQueryResults(context.data, removeToken), [context.data]);

    return {
        loading: context.loading,
        error: context.error,
        data: data,
        refresh: context.refetch,
    }
}


function transformQueryResults(data: TokensQuery, removeToken: string[]): Row[] | undefined {


    const transformedData = data?.tokens?.map(token => {
        const priceUSDArray = token.tokenDayData.map(dayData => Number.parseFloat(dayData.priceUSD)).reverse();

        return {
          symbol: token.symbol,
          name: token.name,
          priceUSD: Number.parseFloat(token.tokenDayData[0].priceUSD),
          volumeUSD: Number.parseFloat(token.tokenDayData[1].volumeUSD),
          priceUSDChange24Hr: Number.parseFloat(token.tokenDayData[0].priceUSD) - Number.parseFloat(token.tokenDayData[1].priceUSD),
          priceChange24Hr: (Number.parseFloat(token.tokenDayData[0].priceUSD) - Number.parseFloat(token.tokenDayData[1].priceUSD)) / Number.parseFloat(token.tokenDayData[1].priceUSD) * 100,
          totalValueLockedUSD: Number.parseFloat(token.totalValueLockedUSD),
          priceUSDArray: priceUSDArray
        };
      }).sort((a, b) => b.totalValueLockedUSD - a.totalValueLockedUSD);
    
      const filteredData = transformedData?.filter(row => !removeToken.includes(row.symbol));
      return filteredData;
}


