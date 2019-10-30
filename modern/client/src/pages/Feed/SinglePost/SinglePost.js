import React, { Component } from 'react';

import Image from '../../../components/Image/Image';
import { GRAPHQL_URL } from '../../../util/constants';
import './SinglePost.css';

class SinglePost extends Component {
  state = {
    title: '',
    author: '',
    date: '',
    image: '',
    content: ''
  };

  componentDidMount() {
    const postId = this.props.match.params.postId;

    const graphQlQuery = {
      query: `
        query POST($id: ID!) {
          post(id: $id) {
            title, content, imageUrl, creator { name }, createdAt
          }
        }
      `,
      variables: {
        id: postId
      }
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
        if (res.status !== 200) {
          throw new Error('Failed to fetch status');
        }
        return res.json();
      })
      .then(resData => {
        this.setState({
          title: resData.data.post.title,
          author: resData.data.post.creator.name,
          image: `http://localhost:8080/${resData.data.post.imageUrl}`,
          date: new Date(resData.data.post.createdAt).toLocaleDateString('en-US'),
          content: resData.data.post.content
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <section className="single-post">
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <div className="single-post__image">
          <Image contain imageUrl={this.state.image} />
        </div>
        <p>{this.state.content}</p>
      </section>
    );
  }
}

export default SinglePost;
