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

import { zomes } from '../services/socialcollaboration.zome';
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
      loading: true,
      openModal: false,
      post_content: '',
      posts: []
    };
  }

  componentDidMount() {
    this.getThreadInfo();
    this.updatePosts();
  }

  updatePosts = async () => {
    const { threadId } = this.state;
    const posts = await this.getPosts(threadId);
    this.setState({ posts });
  };

  getPosts = async (thread_address) => {
    this.setState({ loading: true });
    const _posts = await zomes.getPosts(thread_address);
    const posts = await Promise.all(_posts.map(async post => {
        const username = await zomes.getUsername(post.creator);
        return {...post, username};
      }));
    this.setState({ loading: false });
    return posts;
  };

  /**
   * Gets current Thread's info
   */
  getThreadInfo = async () => {
    const { threadId } = this.state;
    const thread = await zomes.getThread(threadId);
    this.setState({ thread });
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleFormSubmit = async e => {
    e.preventDefault();
    const { threadId, post_content } = this.state;

    if (post_content) {
      await zomes.createPost({
        content: post_content,
        utc_unix_time: Math.floor(+new Date() / 1000),
        thread: threadId
      });

      this.setState({ post_content: '', openModal: false }, () => {
        setTimeout(() => {
          this.updatePosts();
        }, 500);
      });
    }
  };

  render() {
    const { classes } = this.props;
    const { thread, posts } = this.state;

    return (
      <div className={classes.container}>
        <Button size="small" component={RouterLink} to='/Dashboard' className={classes.backButton}><KeyboardArrowLeft />Back</Button>

        <Paper className={classes.paper} elevation={1}>
          <Typography variant="h5" component="h3" gutterBottom>{thread && thread.title} Posts</Typography>
          <Divider />

          {this.state.loading ? <Loader /> : (posts.length > 0) ?
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {posts.map((post, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(post.timestamp).toLocaleDateString()}</TableCell>
                    <TableCell>{post.username}</TableCell>
                    <TableCell>{post.content}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            :
            <Paper className={classes.paper} elevation={0}>
              <div className={classes.appBarSpacer} />
              <Typography component="p" align="center">No Posts Found</Typography>
              <div className={classes.appBarSpacer} />
            </Paper>
          }
        </Paper>

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