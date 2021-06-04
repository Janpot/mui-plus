import { Autocomplete, TextField, InputAdornment } from '@material-ui/core';
import * as React from 'react';
import { SearchApiResponse } from 'site-search/handler';
import useSWR from 'swr';
import SearchIcon from '@material-ui/icons/Search';
import { useRouter } from 'next/router';

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
  const router = useRouter();
  return (
    <Autocomplete
      onInputChange={(_event, newValue) => setInput(newValue)}
      options={data?.results || []}
      sx={{ width: 250 }}
      filterOptions={identity}
      onChange={(_event, option) => {
        setInput('');
        if (option && typeof option !== 'string') {
          router.push(
            option.doc.path + (option.doc.anchor ? `#${option.doc.anchor}` : '')
          );
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search"
          size="small"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            type: 'search…',
          }}
        />
      )}
      freeSolo
      renderOption={(props, option) => {
        return (
          <li {...props}>
            <span>
              {option.snippets.text
                ? option.snippets.text.parts.map((part, i) =>
                    i % 2 === 1 ? <em key={i}>{part}</em> : part
                  )
                : null}
            </span>
          </li>
        );
      }}
      getOptionLabel={(option) => option.doc.text || 'dunno'}
    />
  );
}
