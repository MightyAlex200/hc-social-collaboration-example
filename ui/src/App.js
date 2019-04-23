import React, { Component } from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import { pink } from '@material-ui/core/colors';
import CssBaseline from '@material-ui/core/CssBaseline';
import './App.scss';
import {Dashboard} from './screens';

const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: pink
  },
  typography: {
    useNextVariants: true,
  },
});

class App extends Component {
  render() {
    return (
      <MuiThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Dashboard />
      </MuiThemeProvider>
    );
  }
}

export default App;
