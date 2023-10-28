import { useLazyQuery } from '@apollo/client';
import { Button, Group, Pagination, Stack, Table } from '@mantine/core';
import { PoolsDocument, PoolsQuery } from '../graphql/queries/pools.graphql.interface';
import { useEffect, useMemo } from 'react';
import { formatUSD } from '../lib/currency';
import { PaginationContext, usePagination } from '../lib/usePagination';
import { notifyError } from '../lib/notifications';
import { TableSkeleton } from './TableSkeleton';

//TODO env
const PAGE_SIZE: number = 12;

const COLUMNS: string[] = [
    "Pool",
    "TVL (USD)",
    "Volume (24hr)"
]

interface Row {
    token0Symbol: string;
    token1Symbol: string;
    totalValueLockedUSD: number;
    volume24HrUSD: number;
}

// TODO column-sorted table https://ui.mantine.dev/component/table-sort
// TODO column tooltips?
export function Pools() {
    const pagination = usePagination();
    const topPoolsContext = useTopPools(pagination);

    useEffect(() => {
        if (topPoolsContext.error !== undefined) {
            notifyError(
                "Pools Issue",
                "We're having trouble loading top pools. Please refresh in a minute.",
                topPoolsContext.error
            );
        }
    }, [topPoolsContext.error]);

    return (
        <Stack>
            {topPoolsContext.loading && <TableSkeleton columns={COLUMNS} rows={PAGE_SIZE} data-testid="loading" />}
            {!topPoolsContext.loading && (<Stack align='center'>
                <Table striped>
                    <thead>
                        <tr>
                            {COLUMNS.map(c => <th key={c}>{c}</th>)}
                        </tr>
                    </thead>
                    <tbody>{topPoolsContext.data?.map((row, i) => (
                        <tr key={`${row.token0Symbol}-${row.token1Symbol}-${i}`}>
                            <td>{row.token0Symbol} ↔ {row.token1Symbol}</td>
                            <td>{formatUSD(row.totalValueLockedUSD)}</td>
                            <td>{formatUSD(row.volume24HrUSD)}</td>
                        </tr>
                    ))}</tbody>
                </Table>
                <Group>
                    <Button onClick={() => topPoolsContext.refresh()}>⟳</Button>
                </Group>
            </Stack>)}
        </Stack>
    );
}

interface UseTopPoolsContext {
    data: Row[] | undefined;
    loading: boolean;
    error: Error | undefined;
    refresh: () => void;
}

function useTopPools(pagination: PaginationContext): UseTopPoolsContext {
    const [query, context] = useLazyQuery(PoolsDocument, {
        variables: {
            first: PAGE_SIZE
        }
    });

    // initial load and page change
    useEffect(() => {
        query({ variables: { skip: PAGE_SIZE * pagination.index } });
    }, [pagination.index]);

    const data: UseTopPoolsContext["data"] = useMemo(() => transformQueryResults(context.data), [context.data]);

    return {
        loading: context.loading,
        error: context.error,
        data: data,
        refresh: context.refetch
    }
}


function transformQueryResults(data: PoolsQuery): Row[] | undefined {
    if (data === undefined) return undefined;
    return data.pools.map(pool => ({
        token0Symbol: pool.token0.symbol,
        token1Symbol: pool.token1.symbol,
        totalValueLockedUSD: Number.parseFloat(pool.totalValueLockedUSD),
        volume24HrUSD: computeVolumeChange(pool.poolDayData)
    })).sort((a, b) => b.totalValueLockedUSD - a.totalValueLockedUSD);
}


//TODO better graphql typings
function computeVolumeChange(data: { volumeUSD: string }[]): number {
    if (data.length < 2) return 0;
    return Number.parseFloat(data[1].volumeUSD) - Number.parseFloat(data[0].volumeUSD);
}
