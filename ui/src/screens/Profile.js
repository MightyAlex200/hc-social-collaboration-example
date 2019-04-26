import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';

import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';

import zome from '../services/socialcollaboration.zome';

const styles = theme => ({
  paper: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 3,
  },
  form: {
    marginBottom: theme.spacing.unit * 3,
  },
  container: {
    width: 500,
    margin: '0 auto',
  },
  appBarSpacer: theme.mixins.toolbar,
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  button: {
    margin: theme.spacing.unit,
    marginTop: 30,
  },
});

class Profile extends React.Component {
  state = {
    skill: '',
    my_skills: []
  };

  componentDidMount() {
    this.updatetMySkills();
  }

  updatetMySkills = () => {
    zome.get_my_skills()
      .then(resp => JSON.parse(resp).Ok)
      .then(skills => {
        console.log(skills);
        this.setState({my_skills: skills})
      });
  };

  removeSkill = (skill) => {
    console.log({skill: skill});
    zome.remove_skill({skill: skill})
      .then(resp => {
        console.log(resp);
        setTimeout(() => this.updatetMySkills(), 550); // Delay refresh to wait for confirmation
      });
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleFormSubmit = e => {
    e.preventDefault();

    if (this.state.skill) {
      zome.add_skill({skill: this.state.skill})
        .then(resp => {
          setTimeout(() => this.updatetMySkills(), 250); // Delay refresh to wait for confirmation
        });
      this.setState({skill: ''});
    }
  };

  render() {
    const { classes } = this.props;
    const { my_skills } = this.state;

    return (
      <div className={classes.container}>
        <div className={classes.appBarSpacer} />
        {/* <Typography variant="h4" gutterBottom component="h2">Profile</Typography> */}
        <Paper className={classes.paper} elevation={1}>
          <Typography variant="h5" component="h3" gutterBottom>Add New Skills</Typography>
          <Divider />
          <form className={classes.form} noValidate autoComplete="off" onSubmit={this.handleFormSubmit}>
            <TextField
              id="standard-name"
              label="Enter a new skill"
              className={classes.textField}
              value={this.state.skill}
              onChange={this.handleChange('skill')}
              margin="normal"
              fullWidth
            />
            <Button variant="contained" color="secondary" type="submit" className={classes.button}>Add Skill</Button>
          </form>
          {!!my_skills.length &&
            <Fragment>
              <Divider />
              <List dense={true} subheader={<ListSubheader>My Skills</ListSubheader>}>
                {my_skills.map((skill, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={skill} />
                    <ListItemSecondaryAction>
                      <IconButton aria-label="Delete" onClick={() => this.removeSkill(skill)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Fragment>
            }
        </Paper>
      </div>
    );
  }
}

Profile.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Profile);