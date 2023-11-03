import React from 'react';
import { Text, Button, Group, Pagination, Stack, Table } from '@mantine/core';
import {
    IconArrowDown,
    IconArrowUp
  } from '@tabler/icons-react';
export const getTVLChange = (oldTVL: number, newTVL: number) => {
    let tvlChange = ((newTVL - oldTVL) / oldTVL) * 100;
    if (tvlChange < 0) {
      if (Math.abs(tvlChange).toFixed(2) === '0.00') {
        return <Text style={{ color: 'green' }}>{Math.abs(tvlChange).toFixed(2)}</Text>;
      } else {
        return (
          <Text style={{ color: 'red', display: 'flex', alignItems: 'center' }}>
            {Math.abs(tvlChange).toFixed(2)}% <IconArrowDown size={20} />
          </Text>
        );
      }
    } else {
      if (Math.abs(tvlChange).toFixed(2) === '0.00') {
        return <p style={{ color: 'green' }}>{Math.abs(tvlChange).toFixed(2)}</p>;
      } else {
        return (
          <p style={{ color: 'green', display: 'flex', alignItems: 'center' }}>
            {Math.abs(tvlChange).toFixed(2)}% <IconArrowUp size={20} />
          </p>
        );
      }
    }
  };