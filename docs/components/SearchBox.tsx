import {
  Autocomplete,
  experimentalStyled as styled,
  alpha,
  InputBase,
  Popper,
  PopperProps,
  autocompleteClasses,
  InputBaseProps,
  Divider,
} from '@material-ui/core';
import * as React from 'react';
import { SearchApiResponse } from 'site-search/handler';
import useSWR from 'swr';
import SearchIcon from '@material-ui/icons/Search';
import { useRouter } from 'next/router';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
  [`& .${autocompleteClasses.clearIndicator}`]: {
    color: 'inherit',
  },
  [`& .${autocompleteClasses.endAdornment}`]: {
    right: theme.spacing(1),
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

const SearchResult = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  flex: 1,
});
const SearchResultTitle = styled('div')(({ theme }) => ({
  ...theme.typography.body2,
  color: theme.palette.text.secondary,
  width: 100,
  textAlign: 'right',
  margin: theme.spacing(1),
}));
const SearchResultBody = styled('div')(({ theme }) => ({
  flex: 1,
  margin: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
}));
const SearchResultSubtitle = styled('div')({
  fontWeight: 'bold',
  fontSize: '1.2em',
});
const SearchResultText = styled('div')(({ theme }) => ({
  ...theme.typography.body2,
}));
const Highlight = styled('span')({
  fontWeight: 'bold',
});

const StyledPopper = styled(Popper)({
  [`& .${autocompleteClasses.listbox}`]: {
    maxHeight: '70vh',
  },
});

function CustomPopper(props: PopperProps) {
  return (
    <StyledPopper
      {...props}
      style={{ ...props.style, width: 600 }}
      placement="bottom-end"
    />
  );
}

const AppBarSearchField = React.forwardRef<HTMLDivElement, InputBaseProps>(
  ({ className, ...props }, ref) => {
    return (
      <Search ref={ref}>
        <SearchIconWrapper>
          <SearchIcon />
        </SearchIconWrapper>
        <StyledInputBase
          placeholder="Search…"
          {...props}
          inputProps={{ 'aria-label': 'search', ...props.inputProps }}
        />
      </Search>
    );
  }
);

function useLatest<S>(value: S | undefined): S | undefined {
  const latest = React.useRef(value);
  if (value !== undefined) {
    latest.current = value;
  }
  return latest.current;
}

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

  const latestResults = useLatest(input ? data?.results : []);

  const router = useRouter();

  const sortedOptions = React.useMemo(() => {
    if (!latestResults) {
      return [];
    } else {
      const lvl0Values = [
        ...new Set(latestResults.map((result) => result.doc.lvl0)),
      ];
      return lvl0Values.flatMap((lvl0) =>
        latestResults.filter((result) => result.doc.lvl0 === lvl0)
      );
    }
  }, [latestResults]);

  return (
    <Autocomplete
      onInputChange={(_event, newValue) => setInput(newValue)}
      options={sortedOptions}
      filterOptions={identity}
      onChange={(_event, option) => {
        if (option && typeof option !== 'string') {
          router.push(
            option.doc.path +
              (option.doc.anchor ? `#${option.doc.anchor}` : ''),
            undefined,
            {
              scroll: true,
            }
          );
        }
      }}
      renderInput={(params) => (
        <AppBarSearchField
          {...params.InputProps}
          inputProps={params.inputProps}
        />
      )}
      groupBy={(option) => option.doc.lvl0 || ''}
      PopperComponent={CustomPopper}
      freeSolo
      disableListWrap
      renderOption={(props, option) => {
        const levels = [
          option.doc.lvl0,
          option.doc.lvl1,
          option.doc.lvl2,
          option.doc.lvl3,
          option.doc.lvl4,
          option.doc.lvl5,
        ].filter(Boolean) as string[];

        const section = levels.shift();
        const title = levels.shift() || section;
        const subtitle = levels.join(' › ') || title;

        return (
          <li {...props}>
            <SearchResult>
              <SearchResultTitle>{title}</SearchResultTitle>
              <Divider orientation="vertical" flexItem />
              <SearchResultBody>
                <SearchResultSubtitle>{subtitle}</SearchResultSubtitle>
                <SearchResultText>
                  {option.snippets.text
                    ? option.snippets.text.parts.map((part, i) =>
                        i % 2 === 1 ? (
                          <Highlight key={i}>{part}</Highlight>
                        ) : (
                          part
                        )
                      )
                    : null}
                </SearchResultText>
              </SearchResultBody>
            </SearchResult>
          </li>
        );
      }}
      getOptionLabel={(option) => option.doc.text || 'dunno'}
    />
  );
}