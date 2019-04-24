import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import { pink } from '@material-ui/core/colors';
import CssBaseline from '@material-ui/core/CssBaseline';

import './App.scss';
import Layout from './Layout';
import { Dashboard, Profile } from './screens';

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
        <Router>
          <Layout>
            <Route path="/" exact component={Dashboard} />
            <Route path="/Dashboard" component={Dashboard} />
            <Route path="/Profile" component={Profile} />
          </Layout>
        </Router>
      </MuiThemeProvider>
    );
  }
}

export default App;
