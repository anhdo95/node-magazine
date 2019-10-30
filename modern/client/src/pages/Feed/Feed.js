import React, { Component, Fragment } from 'react';

import Post from '../../components/Feed/Post/Post';
import Button from '../../components/Button/Button';
import FeedEdit from '../../components/Feed/FeedEdit/FeedEdit';
import Input from '../../components/Form/Input/Input';
import Paginator from '../../components/Paginator/Paginator';
import Loader from '../../components/Loader/Loader';
import ErrorHandler from '../../components/ErrorHandler/ErrorHandler';
import './Feed.css';

import { DOMAIN, GRAPHQL_URL, ITEMS_PER_PAGE } from '../../util/constants'

class Feed extends Component {
  state = {
    isEditing: false,
    posts: [],
    totalPosts: 0,
    editPost: null,
    status: '',
    postPage: 1,
    postsLoading: true,
    editLoading: false
  };

  componentDidMount() {
    const graphQlQuery = {
      query: `
        {
          user { status }
        }
      `
    }

    fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.props.token}`
      },
      body: JSON.stringify(graphQlQuery)
    })
      .then(res => {
        return res.json(graphQlQuery);
      })
      .then(resData => {
        this.setState({ status: resData.data.user.status });
      })
      .catch(this.catchError);

    this.loadPosts();
  }

  loadPosts = direction => {
    if (direction) {
      this.setState({ postsLoading: true, posts: [] });
    }
    let page = this.state.postPage;
    if (direction === 'next') {
      page++;
      this.setState({ postPage: page });
    }
    if (direction === 'previous') {
      page--;
      this.setState({ postPage: page });
    }

    const graphQlQuery = {
      query: `
        query FetchPosts($page: Int!) {
          posts(queryInput: { page: $page, itemsPerPage: ${ITEMS_PER_PAGE} }) {
            items {
              _id, title, imageUrl, content, creator { name }, createdAt
            }, totalItems
          }
        }
      `,
      variables: { page }
    }

    fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.props.token}`
      },
      body: JSON.stringify(graphQlQuery)
    })
      .then(res => {
        return res.json();
      })
      .then(resData => {
        const posts = resData.data.posts.items.map(post => {
          return {
          ...post,
          imagePath: post.imageUrl
          }
        })

        this.setState({
          posts,
          totalPosts: resData.data.posts.totalItems,
          postsLoading: false
        });
      })
      .catch(this.catchError);
  };

  statusUpdateHandler = event => {
    event.preventDefault();

    const graphQlQuery = {
      query: `
        mutation UpdateUserStatus($status: String!) {
          updateUserStatus(status: $status) {
            status
          }
        }
      `,
      variables: { status: this.state.status }
    };

    fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.props.token}`
      },
      body: JSON.stringify(graphQlQuery)
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error("Can't update status!");
        }
        return res.json();
      })
      .then(resData => {
        console.log(resData);
      })
      .catch(this.catchError);
  };

  newPostHandler = () => {
    this.setState({ isEditing: true });
  };

  startEditPostHandler = postId => {
    this.setState(prevState => {
      const loadedPost = { ...prevState.posts.find(p => p._id === postId) };

      return {
        isEditing: true,
        editPost: loadedPost
      };
    });
  };

  cancelEditHandler = () => {
    this.setState({ isEditing: false, editPost: null });
  };

  finishEditHandler = async (postData) => {
    this.setState({
      editLoading: true
    });

    const formData = new FormData();
    formData.append("title", postData.title);
    formData.append("content", postData.content);
    formData.append("image", postData.image);

    if (this.state.editPost) {
      formData.append("oldFilePath", this.state.editPost.imageUrl);
    }

    return fetch(`${DOMAIN}/post-image`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.props.token}`
      },
      body: formData
    })
      .then(res => res.json())
      .then(fileResData => {
        let graphQlQuery

        if (this.state.editPost) {
          graphQlQuery = {
            query: `
              mutation UpdatePost($id: ID!, $title: String!, $content: String!, $imageUrl: String!) {
                updatePost(
                  id: $id,
                  postInput: {
                    title: $title,
                    content: $content,
                    imageUrl: $imageUrl
                }) {
                  _id, title, content, imageUrl, creator { name }, createdAt
                }
              }
            `,
            variables: {
              id: this.state.editPost._id,
              title: postData.title,
              content: postData.content,
              imageUrl: fileResData.filePath || this.state.editPost.imageUrl
            }
          };
        } else {
          graphQlQuery = {
            query: `
              mutation CreatePost($title: String!, $content: String!, $imageUrl: String!) {
                createPost(postInput: {
                  title: $title,
                  content: $content,
                  imageUrl: $imageUrl
                }) {
                  _id, title, content, imageUrl, creator { name }, createdAt
                }
              }
            `,
            variables: {
              title: postData.title,
              content: postData.content,
              imageUrl: fileResData.filePath
            }
          };
        }

        return fetch(GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.props.token}`
          },
          body: JSON.stringify(graphQlQuery)
        });
      })
      .then(res => {
        return res.json();
      })
      .then(resData => {
        this.setState(prevState => {
          const updatedPosts = [...prevState.posts];

          if (resData.data.createPost && prevState.postPage === 1) {
              updatedPosts.unshift(resData.data.createPost);
              updatedPosts.splice(ITEMS_PER_PAGE);
          } else if (resData.data.updatePost) {
            const updatedPostIndex = updatedPosts.findIndex(p => p._id === resData.data.updatePost._id)

            if (~updatedPostIndex) {
              updatedPosts[updatedPostIndex] = resData.data.updatePost
            }
          }

          return {
            posts: updatedPosts,
            isEditing: false,
            editPost: null,
            editLoading: false
          };
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          isEditing: false,
          editPost: null,
          editLoading: false,
          error: err
        });
      });
  };

  statusInputChangeHandler = (input, value) => {
    this.setState({ status: value });
  };

  deletePostHandler = postId => {
    this.setState({ postsLoading: true });

    const graphQlQuery = {
      query: `
        mutation DeletePost($id: ID!) {
          deletePost(id: $id)
        }
      `,
      variables: {
        id: postId
      }
    };

    fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.props.token}`
      },
      body: JSON.stringify(graphQlQuery)
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Deleting a post failed!');
        }
        return res.json();
      })
      .then(resData => {
        if (resData.data.deletePost) {
          this.loadPosts()
        }
      })
      .catch(err => {
        console.log(err);
        this.setState({ postsLoading: false });
      });
  };

  errorHandler = () => {
    this.setState({ error: null });
  };

  catchError = error => {
    this.setState({ error: error });
  };

  render() {
    return (
      <Fragment>
        <ErrorHandler error={this.state.error} onHandle={this.errorHandler} />
        <FeedEdit
          editing={this.state.isEditing}
          selectedPost={this.state.editPost}
          loading={this.state.editLoading}
          onCancelEdit={this.cancelEditHandler}
          onFinishEdit={this.finishEditHandler}
        />
        <section className="feed__status">
          <form onSubmit={this.statusUpdateHandler}>
            <Input
              type="text"
              placeholder="Your status"
              control="input"
              onChange={this.statusInputChangeHandler}
              value={this.state.status}
            />
            <Button mode="flat" type="submit">
              Update
            </Button>
          </form>
        </section>
        <section className="feed__control">
          <Button mode="raised" design="accent" onClick={this.newPostHandler}>
            New Post
          </Button>
        </section>
        <section className="feed">
          {this.state.postsLoading && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Loader />
            </div>
          )}
          {this.state.posts.length <= 0 && !this.state.postsLoading ? (
            <p style={{ textAlign: 'center' }}>No posts found.</p>
          ) : null}
          {!this.state.postsLoading && (
            <Paginator
              onPrevious={this.loadPosts.bind(this, 'previous')}
              onNext={this.loadPosts.bind(this, 'next')}
              lastPage={Math.ceil(this.state.totalPosts / 2)}
              currentPage={this.state.postPage}
            >
              {this.state.posts.map(post => (
                <Post
                  key={post._id}
                  id={post._id}
                  author={post.creator.name}
                  date={new Date(post.createdAt).toLocaleDateString('en-US')}
                  title={post.title}
                  image={post.imageUrl}
                  content={post.content}
                  onStartEdit={this.startEditPostHandler.bind(this, post._id)}
                  onDelete={this.deletePostHandler.bind(this, post._id)}
                />
              ))}
            </Paginator>
          )}
        </section>
      </Fragment>
    );
  }
}

export default Feed;
