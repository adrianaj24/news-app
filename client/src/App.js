import React, { Component } from "react";
import Pusher from "pusher-js";
import pushid from "pushid";
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { newsItems: [], value: "" };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit(event) {
    alert("Subject Submitted:" + this.state.value);
    var topic = this.state.value;
    console.log("THIS IS THE TOPIC", topic);
    event.preventDefault();

    fetch("http://localhost:5000/api/search", {
      method: "POST",
      body: JSON.stringify({ firstParam: topic }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(response => console.log("SUCCESS"));
  }

  componentDidMount() {
    fetch("http://localhost:5000/live")
      .then(response => response.json())
      .then(articles => {
        this.setState({
          newsItems: [...this.state.newsItems, ...articles]
        });
      })
      .catch(error => console.log(error));

    const pusher = new Pusher("4090b8923a8486b83589", {
      cluster: "us2",
      encrypted: true
    });

    const channel = pusher.subscribe("news-channel");
    channel.bind("update-news", data => {
      this.setState({
        newsItems: [...data.articles, ...this.state.newsItems]
      });
    });
  }
  render() {
    const NewsItem = (article, id) => (
      <li key={id}>
        <a href={`${article.url}`}>{article.description}</a>
      </li>
    );

    const newsItems = this.state.newsItems.map(e => NewsItem(e, pushid()));

    return (
      <div className="App">
        <h1 className="App-title">News Feed</h1>
        <form className="news-search" onSubmit={this.handleSubmit}>
          <input
            className="submit-button"
            type="text"
            onChange={this.handleChange}
            value={this.state.value}
          />
          <input className="submit-button" type="submit" value="Submit" />
        </form>
        <ul className="news-items">{newsItems}</ul>
      </div>
    );
  }
}

export default App;
