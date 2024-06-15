import React from 'react';
import { Provider } from 'react-redux';
import store from './store/Store';
import './App.css';
import Dashboard from './features/dash/components/Dashboard';

function App() {
  return (
    <Provider store={store}>
    <div>
      <Dashboard name="Tonderai" />
    </div>
    </Provider>
  );
}

export default App;
