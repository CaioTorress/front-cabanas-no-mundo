// src/TestTheme.js
import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';
import ModalTest from './ModalTest';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function TestTheme() {
  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: 20 }}>
        <ModalTest />
      </div>
    </ThemeProvider>
  );
}

export default TestTheme;
