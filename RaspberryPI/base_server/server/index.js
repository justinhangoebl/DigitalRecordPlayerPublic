const express = require("express");
const request = require("request");
const dotenv = require("dotenv");
const http = require("http");
const cors = require("cors");
const axios = require("axios");
const asyncHandler = require("express-async-handler");

global.access_token = "";
global.id = "";
global.nfc_ready = false;

dotenv.config();

// IP as variable because Express.js does not like hostnames
const raspberrypiIP = "192.168.86.252";

// SPOTIFY VARIABLES
var spotify_client_id = process.env.SPOTIFY_CLIENT_ID;
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET;

var spotify_redirect_uri = `http://${raspberrypiIP}:3000/auth/callback`;

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
  origin: [
    "http://localhost:3000",
    "http://localhost:5000",
    "http://localhost",
    "http://192.168.253.252:3000",
    "http://192.168.253.252:5000",
    `http://${raspberrypiIP}:3000`,
    `http://${raspberrypiIP}:5000`,
  ],
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

// To be able to skip from a Client Request
app.get("/nfc_ready", (req, res) => {
  res.json({ nfc_ready: nfc_ready });
}
);

// Pane to get the id
app.get("/id", (req, res) => {
  res.json({ id: id });
});

// POST Requests Pane
// To be able to play Songs from a Client Request / from the NFC Card
app.post(
  "/play",
  asyncHandler(async (req, res) => {
    // TODO Add a named pipe for the Bearer OAuth token or use axios get /auth/token

    //https://www.codeproject.com/questions/553581/namedpluspipesplusinplusjavascript

    //
    try {
      // requesting to play uses query params
      id = req.query.id;
      currPlayingID = 0;

      // get the currently playing song from the Spotify API
      axios({
        url: "https://api.spotify.com/v1/me/player/currently-playing",
        method: "get",
        headers: {
          authorization: `Bearer ${access_token}`,
        },
      })
        // set the currently Playing ID or to zero if nothing is playing
        .then((response) => {
          if (response.data !== null) {
            currPlayingID = response.data.id;
          } else {
            currPlayingID = 0;
          }
        });

      // only play the song if its not currently playing
      if (id !== currPlayingID) {
        // making a axios request to the Spotify API to play the Song with the ID
        await axios({
          url: "https://api.spotify.com/v1/me/player/play/",
          method: "put",
          headers: {
            authorization: `Bearer ${access_token}`,
          },
          data: {
            uris: [`spotify:track:${id}`],
          },
        }).catch((error) => {
          console.log("Error: " + error + "\nAccess Token: " + access_token);
        });
        res.status(200).send("SUCCESS Playing: " + access_token);
      }
    } catch (error) {
      res
        .status(404)
        .json({
          message: "Couldn't get Info from Spotify API",
          error: error,
          access_token: access_token,
        });
    }
  })
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

// Update the ready state of the NFC
app.post("/nfc_ready", (req, res) => {
  nfc_ready = req.query.nfc_ready;
  res.status(200).send("SUCCESS set: " + nfc_ready);
}
);

// Server Pane, listen to the requests on PORT 5000
server.listen(5000, "0.0.0.0");
server.on("listening", function () {
  // TODO delete OAuth named pipe if not axios is working
  console.log(
    "Express server started on port %s at %s",
    server.address().port,
    server.address().address
  );
});
