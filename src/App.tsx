import React from 'react';
import { Provider } from 'react-redux';
import store from './store/Store';
import './App.css';
import Dashboard from './features/dash/components/Dashboard';
import DashContainer from './features/dash/Container/DashContainer';

function App() {
  return (
    <Provider store={store}>
    <div>
      <DashContainer/>
    </div>
    </Provider>
  );
}

export default App;
