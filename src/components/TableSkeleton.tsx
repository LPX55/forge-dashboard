import { Skeleton, Table, Text, Group } from "@mantine/core";

export function TableSkeleton(props: { columns: string[], rows: number }): JSX.Element {
    return <Table verticalSpacing="lg">
        <Table.Thead>
            <Table.Tr>
            <Group justify="space-between">
            <Text fw={500} fz="sm">{props.columns.map(((c, i) => <Table.Th key={i}>{c}</Table.Th>))}</Text>
            </Group>
            </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{Array(props.rows).fill(null).map((_, i) => (
            <Table.Tr key={`${i}`}>
                 <Group justify="space-between">
                {props.columns.map((_) => (
                    <Table.Td><Skeleton height="1.5rem" /></Table.Td>
                ))}
                </Group>
            </Table.Tr>
        ))}</Table.Tbody>
    </Table>
}
