const express = require("express");
const cors = require("cors");
const Pusher = require("pusher");
const NewsAPI = require("newsapi");
const env = require("./client/variables.env");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const pusher = new Pusher({
  appId: env.PUSHER_APP_ID,
  key: env.PUSHER_APP_KEY,
  secret: env.PUSHER_APP_SECRET,
  cluster: env.PUSHER_APP_CLUSTER,
  encrypted: true
});

const newsapi = new NewsAPI(env.NEWS_API_KEY);

const fetchNews = (searchTerm, pageNum) =>
  newsapi.v2.everything({
    q: searchTerm,
    language: "en",
    page: pageNum,
    pageSize: 5
  });

app.use(cors());

function updateFeed(topic) {
  let counter = 2;
  setInterval(() => {
    fetchNews(topic, counter)
      .then(response => {
        pusher.trigger("news-channel", "update-news", {
          articles: response.articles
        });
        counter += 1;
      })
      .catch(error => console.log(error));
  }, 6000);
}

app.get("/live", (req, res) => {
  const topic = "technology";
  fetchNews(topic, 1)
    .then(response => {
      res.json(response.articles);
      // updateFeed(topic);
    })
    .catch(error => console.log(error));
});

app.post("/api/search", (req, res) => {
  let topic = req.body.firstParam;
  fetchNews(topic, 1)
    .then(response => {
      console.log(response.articles);
      res.json(response.articles);
      // updateFeed(topic);
    })
    .catch(error => console.log(error));
});

app.set("port", env.PORT || 5000);
const server = app.listen(app.get("port"), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
