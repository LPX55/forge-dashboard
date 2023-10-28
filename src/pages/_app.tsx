import { NextPage } from 'next';
import { AppProps } from 'next/app';
import { ApolloProvider } from '@apollo/client';

import 'normalize.css/normalize.css';
import { useApollo } from '../lib/apollo';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';

const App: NextPage<AppProps> = ({ Component, pageProps }) => {
  const apolloClient = useApollo(pageProps);
  const theme = createTheme({
    fontFamily: "Inter, sans-serif",
    primaryColor: 'gray',
  });

  return (
    <MantineProvider
      defaultColorScheme="dark"
      theme={theme}
    >
        <ApolloProvider client={apolloClient}>
          <Component {...pageProps} />
        </ApolloProvider>
    </MantineProvider>
  );
};

export default App;
