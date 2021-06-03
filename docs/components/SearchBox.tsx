import { Autocomplete, TextField } from '@material-ui/core';
import * as React from 'react';
import { SearchApiResponse, SearchApiResult } from 'site-search/handler';
import useSWR from 'swr';

function identity<T>(x: T): T {
  return x;
}

interface SearchBoxProps {
  endpoint: string;
}

export default function SearchBox({ endpoint }: SearchBoxProps) {
  const [input, setInput] = React.useState<string | null>('');
  const { data } = useSWR<SearchApiResponse>(
    input ? `${endpoint}?q=${input}` : null
  );
  return (
    <Autocomplete<SearchApiResult>
      onInputChange={(_event, newValue) => setInput(newValue)}
      options={data?.results || []}
      sx={{ width: 250 }}
      filterOptions={identity}
      renderInput={(params) => (
        <TextField {...params} label="Search" size="small" />
      )}
      renderOption={(props, option) => {
        return (
          <li {...props}>
            {option.snippets.text ? option.snippets.text.parts.join('') : null}
          </li>
        );
      }}
      getOptionLabel={(option) => option.doc.text || 'dunno'}
    />
  );
}
