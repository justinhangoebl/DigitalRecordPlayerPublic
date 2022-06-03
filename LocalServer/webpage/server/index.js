const express = require("express");
const request = require("request");
const dotenv = require("dotenv");
const http = require("http");
const cors = require("cors");
const axios = require("axios");

global.access_token = "";

dotenv.config();

// SPOTIFY VARIABLES
var spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;

var spotify_redirect_uri = "http://localhost:3000/auth/callback";

var generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

// SERVER Variables and SERVER Setup
var app = express();

var server = http.createServer(app);

// cross origin reference setup
var corsOptions = {
  origin: ["http://localhost:3000"],
};

app.use(cors(corsOptions));

// Get Requests Pane
// create the url to the Spotify login pane and subsequently redirect
app.get("/auth/login", (req, res) => {
  var scope =
    "streaming user-read-email user-read-private app-remote-control user-modify-playback-state user-read-playback-state user-read-currently-playing";
  var state = generateRandomString(16);

  var auth_query_parameters = new URLSearchParams({
    response_type: "code",
    client_id: spotify_client_id,
    scope: scope,
    redirect_uri: spotify_redirect_uri,
    state: state,
  });

  res.redirect(
    "https://accounts.spotify.com/authorize/?" +
      auth_query_parameters.toString()
  );
});

// get the callback from the Spotify API
app.get("/auth/callback", (req, res) => {
  var code = req.query.code;

  var authOptions = {
    url: "https://accounts.spotify.com/api/token",
    form: {
      code: code,
      redirect_uri: spotify_redirect_uri,
      grant_type: "authorization_code",
    },
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(spotify_client_id + ":" + spotify_client_secret).toString(
          "base64"
        ),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    json: true,
  };

  // request the access_token from Spotify API and then redirect to the main page
  request.post(authOptions, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      access_token = body.access_token;
      res.redirect("/");
    }
  });
});

// Pane to get the auth token, to validate the login with the Spotify API
app.get("/auth/token", (req, res) => {
  res.json({ access_token: access_token });
});

// POST Reequests Pane
// To be able to play Songs from a Client Request / from the NFC Card
app.post("/play", (req, res) => {
  // requesting to play uses query params
  id = req.query.id;
    // making a axios request to the Spotify API to play the Song with the ID
    axios({
      url: "https://api.spotify.com/v1/me/player/play/",
      method: "put",
      headers: {
        authorization: `Bearer ${access_token}`,
      },
      data: {
        uris: [`spotify:track:${id}`],
      },
    });
    res.status(204);
  }
);

// To be able to pause Songs from a Client Request / from the NFC Card
app.post("/pause", (req, res) => {
    // making a axios request to the Spotify API to pause the Song with the ID
    axios({
      url: "https://api.spotify.com/v1/me/player/pause/",
      method: "put",
      headers: {
        authorization: `Bearer ${access_token}`,
      }
    });
    res.status(204);
  }
);

// To be able to pause Songs from a Client Request
app.post("/prev", (req, res) => {
    // making a axios request to the Spotify API to play the Song with the ID
    axios({
      url: "https://api.spotify.com/v1/me/player/previous",
      method: "post",
      headers: {
        authorization: `Bearer ${access_token}`,
      }
    });
    res.status(204);
  }
);

// To be able to skip from a Client Request
app.post("/skip", (req, res) => {
    // making a axios request to the Spotify API to play the Song with the ID
    axios({
      url: "https://api.spotify.com/v1/me/player/next",
      method: "post",
      headers: {
        authorization: `Bearer ${access_token}`,
      }
    });
    res.status(204);
  }
);

// Server Pane
server.listen(5000, "localhost");
server.on("listening", function () {
  console.log(
    "Express server started on port %s at %s",
    server.address().port,
    server.address().address
  );
});
