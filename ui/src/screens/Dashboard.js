import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import zome from '../services/socialcollaboration.zome';

const styles = theme => ({
 
});

class Dashboard extends React.Component {
  componentDidMount() {
    zome.get_threads().then(resp => console.log(resp));
  }

  render() {
    const { classes } = this.props;

    return (
      <div className='dashboard'>
        <div className={classes.appBarSpacer} />
        <Typography variant="h4" gutterBottom component="h2">Dashboard</Typography>
      </div>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Dashboard);