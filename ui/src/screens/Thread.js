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

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

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

import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import Grid from '@material-ui/core/Grid';

import zome from '../services/socialcollaboration.zome';
import Loader from '../components/Loader';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
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
  backButton: {
    marginBottom: theme.spacing.unit * 2,
  },
  post: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  }
});

class Thread extends React.Component {
  constructor(props) {
    const { match } = props;
    super(props);

    this.state = {
      threadId: match.params.id,
      thread: {},
      loading: true,
      openModal: false,
      post_content: '',
      threads: [],
      posts: []
    };
  }

  componentDidMount() {
    this.getThread();
    this.updatePosts();
    // this.updateThreads();
  }

  getThread = () => {
    zome.get_thread({address: this.state.threadId})
      .then(resp => JSON.parse(resp).Ok)
      .then(thread => this.setState({thread}));
  }

  // updateThreads = () => {
  //   this.setState({loading: true});

  //   zome.get_threads()
  //     .then(resp => JSON.parse(resp).Ok)
  //     .then(({addresses}) => {
  //       this.addresses = addresses;
  //       return Promise.all(addresses.map(address => zome.get_thread({address})))
  //     })
  //     .then(threads => threads.map((thread, index) => ({...JSON.parse(thread).Ok, address: this.addresses[index]})))
  //     .then(threads => this.setState({threads, loading: false}));
  // };

  updatePosts = () => {
    this.setState({loading: true});

    zome.get_thread_posts({thread: this.state.threadId})
      .then(resp => JSON.parse(resp).Ok)
      .then(posts => this.setState({posts, loading: false}));
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleFormSubmit = e => {
    e.preventDefault();

    if (this.state.post_content) {
      zome.create_post({
        content: this.state.post_content,
        utc_unix_time: Math.floor(+new Date() / 1000),
        thread: this.state.threadId
      })
        .then(resp => {
          console.log(resp);
          setTimeout(() => this.updatePosts(), 250); // Delay refresh to wait for confirmation
        });

      this.setState({post_content: '', openModal: false});
    }
  };

  render() {
    const { classes } = this.props;
    const { thread, posts } = this.state;

    console.log('posts', posts);

    return (
      <div className={classes.container}>
        <Button size="small" component={RouterLink} to='/Dashboard' className={classes.backButton}><KeyboardArrowLeft />Back</Button>
        <Divider />
        <Toolbar>
          <Typography variant="h6" color="inherit">{thread.title}</Typography>

        </Toolbar>
        <Divider />
        {/* <Paper className={classes.paper} elevation={1}>
        </Paper> */}

        {this.state.loading ? Loader : posts.length > 0 ?
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="stretch"
            spacing={24}
            style={{marginTop: 20}}
          >
            {posts.map((post, index) => (
              <Grid key={index} item xs={12} sm={6} md={4}>
                <Paper className={classes.post} elevation={1}>
                  <Typography variant="h6" color="inherit" gutterBottom>{new Date(post.timestamp).toLocaleDateString()}</Typography>
                  <Typography component="p" color="inherit" gutterBottom>{post.content}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          :
          <Fragment>
            <div className={classes.appBarSpacer} />
            <Typography component="h6" align="center">No Posts Found</Typography>
            <div className={classes.appBarSpacer} />
          </Fragment>
        }
        

        {/* <Paper className={classes.paper} elevation={1}>
          <Typography variant="h5" component="h3" gutterBottom>Relevant Threads</Typography>
          <Divider />

          {(threads.length > 0) ?
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
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
        </Paper> */}

        <Dialog
          open={this.state.openModal}
          onClose={() => this.setState({openModal: false})}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Create A New Post</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To create a post, enter your message below
            </DialogContentText>
            <TextField
              autoFocus
              multiline
              rows="5"
              margin="normal"
              id="post"
              label="Message"
              type="text"
              value={this.state.post_content}
              onChange={this.handleChange('post_content')}
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

Thread.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Thread);