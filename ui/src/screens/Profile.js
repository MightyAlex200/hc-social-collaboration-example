import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import zome from '../services/socialcollaboration.zome';

const styles = theme => ({
 
});

class Profile extends React.Component {
  componentDidMount() {
    zome.get_threads().then(resp => console.log(resp));
  }

  render() {
    const { classes } = this.props;

    return (
      <div className='profile'>
        <div className={classes.appBarSpacer} />
        <Typography variant="h4" gutterBottom component="h2">Profile</Typography>
      </div>
    );
  }
}

Profile.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Profile);