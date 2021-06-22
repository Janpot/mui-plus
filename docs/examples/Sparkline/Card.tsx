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

const data = [
  9, 1, 14, 30, 34, 14, 29, 30, 20, 33, 38, 25, 4, 25, 38, 11, 15, 21, 31, 37,
  16, 17, 8, 18, 37, 28, 31, 22, 30, 8, 31, 14, 4, 36, 34, 2, 26, 35, 17, 2, 19,
  1, 30, 2, 16, 23, 35, 1, 14, 33,
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
            <Sparkline sx={{ mt: 2 }} data={data} color="primary" />
          </Stack>
          <Stack direction="column">
            <Typography variant="subtitle2">Engagement</Typography>
            <Typography variant="h4">19%</Typography>
            <TrendText>
              <TrendingDownIcon sx={{ mr: 1 }} color="error" /> -11%
            </TrendText>
            <Sparkline sx={{ mt: 2 }} data={data} color="error" />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
