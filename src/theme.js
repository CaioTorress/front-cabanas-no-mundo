// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Defina a cor primária
    },
    secondary: {
      main: '#dc004e', // Defina a cor secundária
    },   
     default: {
        main: '#a9a9a9', // Defina a cor default
      },
  },
});

export default theme;
