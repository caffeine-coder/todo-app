import React from 'react';
import './App.css';
import { MantineProvider } from '@mantine/core';
import TodoContainer from './components/TodoContainer/TodoContainer';

function App() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <div className="appcontainer">
        <TodoContainer />
      </div>
    </MantineProvider>
  );
}

export default App;
