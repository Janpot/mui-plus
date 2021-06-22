import * as React from 'react';
import { Sparkline } from 'mui-plus';
import {
  Stack,
  Card,
  Typography,
  CardContent,
  experimentalStyled as styled,
} from '@material-ui/core';
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import TrendingDownIcon from '@material-ui/icons/TrendingDown';

const data1 = [
  23, 5, 36, 14, 8, 18, 22, 29, 6, 23, 20, 2, 16, 8, 38, 10, 15, 38, 17, 13, 14,
  7, 3, 39, 24, 13, 38, 25, 21, 14, 28, 31, 14, 8, 13,
];

const data2 = [
  11, 15, 21, 31, 37, 16, 17, 8, 18, 37, 28, 31, 22, 30, 8, 31, 14, 4, 36, 34,
  2, 26, 35, 17, 2, 19, 1, 30, 2, 16, 23, 35, 1, 14, 33,
];

const TrendText = styled(Typography)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}));

export default function Colors() {
  return (
    <Card sx={{ display: 'inline-flex' }}>
      <CardContent>
        <Stack direction="row" spacing={5}>
          <Stack direction="column">
            <Typography variant="subtitle2">Sales</Typography>
            <Typography variant="h4">345.4M</Typography>
            <TrendText>
              <TrendingUpIcon sx={{ mr: 1 }} color="primary" /> +8%
            </TrendText>
            <Typography></Typography>
            <Sparkline sx={{ mt: 2 }} data={data1} color="primary" />
          </Stack>
          <Stack direction="column">
            <Typography variant="subtitle2">Engagement</Typography>
            <Typography variant="h4">19%</Typography>
            <TrendText>
              <TrendingDownIcon sx={{ mr: 1 }} color="error" /> -11%
            </TrendText>
            <Sparkline sx={{ mt: 2 }} data={data2} color="error" />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
