import React from 'react';
import ReactDOM from 'react-dom';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';

import { UserProvider } from "./state/context/UserContext.react";
import { PageProvider } from "./state/context/PageContext.react";
import { Provider } from 'react-redux';

import App from './app.react';

import { Store } from './state/store.react';

import './CSS/drive.css';
import './CSS/features.css';

const queryClient = new QueryClient();

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={Store}>
        <UserProvider>
          <PageProvider>
            <App />
          </PageProvider>
        </UserProvider>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
);