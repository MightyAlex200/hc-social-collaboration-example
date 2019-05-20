import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
  container: {
    padding: theme.spacing.unit * 15,
    display: 'flex',
    justifyContent: 'center',
  },
});

class Loader extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.container}>
        <CircularProgress color="secondary" />
      </div>
    )
  }
}

Loader.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Loader);