import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link as RouterLink } from 'react-router-dom'
import Link from '@material-ui/core/Link';
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
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';

import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Divider from '@material-ui/core/Divider';
import CircularProgress from '@material-ui/core/CircularProgress';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import zome from '../services/socialcollaboration.zome';
import Loader from '../components/Loader';


const styles = theme => ({
  paper: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 3,
  },
  container: {
    margin: '0 auto',
  },
  appBarSpacer: theme.mixins.toolbar,
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 450,
  },
  button: {
    margin: theme.spacing.unit,
    marginTop: 30,
  },
  tableRowHover: {
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
  fabButton: {
    position: 'absolute',
    right: theme.spacing.unit * 3,
    bottom: theme.spacing.unit * 3,
  },
  progress: {
    margin: theme.spacing.unit * 2,
  },
});

class Dashboard extends React.Component {
  state = {
    title: '',
    required_skills: '',
    threads: [],
    loading: true,
    openModal: false
  };

  componentDidMount() {
    this.updateThreads();
  }

  updateThreads = () => {
    this.setState({loading: true});

    zome.get_threads()
      .then(resp => JSON.parse(resp).Ok)
      .then(({addresses}) => {
        this.addresses = addresses;
        Promise.all(addresses.map(address => zome.get_required_skills({thread: address})))
          .then(skills => this.skills = skills);
        return Promise.all(addresses.map(address => zome.get_thread({address})))
      })
      .then(threads => threads.map((thread, index) => ({...JSON.parse(thread).Ok, address: this.addresses[index], skills: JSON.parse(this.skills[index]).Ok})))
      .then(threads => this.setState({threads, loading: false}));
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleFormSubmit = e => {
    e.preventDefault();

    if (this.state.title) {
      zome.create_thread({
        title: this.state.title,
        utc_unix_time: Math.floor(+new Date() / 1000),
        required_skills: [...this.state.required_skills.split(/[\s,]+/)]
      })
        .then(resp => {
          console.log(resp);
          setTimeout(() => this.updateThreads(), 250); // Delay refresh to wait for confirmation
        });

      this.setState({title: '', required_skills: '', openModal: false});
    }
  };

  render() {
    const { classes } = this.props;
    const { threads } = this.state;

    console.log(threads);

    return (
      <div className={classes.container}>
        {/* <div className={classes.appBarSpacer} /> */}
        {/* <Typography variant="h4" gutterBottom component="h2">Dashboard</Typography> */}
        <Paper className={classes.paper} elevation={1}>
          <Typography variant="h5" component="h3" gutterBottom>All Threads</Typography>
          <Divider />

          {this.state.loading ? <Loader /> : (threads.length > 0) ?
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Required Skills</TableCell>
                  <TableCell>Creator</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {threads.map(thread => (
                  <TableRow key={thread.address}>
                    <TableCell component="th" scope="row">
                      <Link component={RouterLink} to={`/Thread/${thread.address}`}>{thread.title}</Link>
                    </TableCell>
                    <TableCell>{thread.skills.join(', ')}</TableCell>
                    <TableCell>{thread.creator}</TableCell>
                    <TableCell>{new Date(thread.timestamp).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            :
            <Paper className={classes.paper} elevation={0}>
              <div className={classes.appBarSpacer} />
              <Typography component="p" align="center">No Threads Found</Typography>
              <div className={classes.appBarSpacer} />
            </Paper>
          }
        </Paper>

        <Dialog
          open={this.state.openModal}
          onClose={() => this.setState({openModal: false})}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Create A New Thread</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To create a new thread, please enter a title and add some skills (optional). Please separate each skill with a comma. e.g. JavaScript, HTML, CSS
            </DialogContentText>
            <TextField
              autoFocus
              margin="normal"
              id="title"
              label="Thread Title"
              type="text"
              value={this.state.title}
              onChange={this.handleChange('title')}
              fullWidth
            />
            <TextField
              margin="normal"
              id="required_skills"
              label="Required Skills"
              type="text"
              value={this.state.required_skills}
              onChange={this.handleChange('required_skills')}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({openModal: false})} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleFormSubmit} color="primary">Create</Button>
          </DialogActions>
        </Dialog>

        <Fab color="secondary" aria-label="Add" className={classes.fabButton} onClick={() => this.setState({openModal: true})}>
          <AddIcon />
        </Fab>
      </div>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Dashboard);