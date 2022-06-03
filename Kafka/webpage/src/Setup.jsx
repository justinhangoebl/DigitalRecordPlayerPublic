import React, { Component } from "react";

const axios = require("axios");
const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "kafkaTracker",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

/*
 * Setup Class renders a Compnent
 * as props gets the spotify OAuth acces token
 * render() renders a Webpage with a Search Bar and some information about searched Songs
 */
class Setup extends Component {
  // Constructor to set the base State values
  constructor(props) {
    super();
    const token = props.token;
    this.state = {
      token: token,
      loggedIn: token ? true : false,
      track: null,
    };
  }

  // Get the seaerch Ressults from the inserted Link and automatically update when pasting
  getSearchResults(query) {
    const access_token = this.state.token;
    const searchQuery = query.toString();
    const id = searchQuery.split("/")[4].split("?")[0];

    // request the spotify api for song information using a link
    axios({
      url: `https://api.spotify.com/v1/tracks/${id}`,
      method: "get",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
      // Convert the response data and check for error codes
      .then((response) => {
        if (response.status < 200 || response.status >= 400) {
          throw Error("Response Not Ok");
        }
        return response.data;
      })
      //update the song in our state
      .then((current_track) => {
        this.setState({
          track: current_track,
        });
      })
      //reset the Song if it is not a link or no song was found
      .catch((error) =>
        this.setState({
          track: null,
        })
      );
  }

  // On search press play the song with a post request to the server itself, with the id as client param
  async playSongFromResult() {
    axios
      .post(`http://localhost:5000/play?id=${this.state.track.id}`)
      .catch((error) => console.log(error));
  }

  // play previous Song
  async prevSong() {
    axios
      .post(`http://localhost:5000/prev`)
      .catch((error) => console.log(error));
  }

  // skip to the next Song
  async skipSong() {
    axios
      .post(`http://localhost:5000/skip`)
      .catch((error) => console.log(error));
  }

  //on write click we want to write the id onto the broker
  async writeToBroker() {
    // only write to Broker if we selected a track
    if (this.state.track !== null) {
      await producer.connect();
      await producer.send({
        topic: "ID",
        messages: [{ value: this.state.track.id }],
      });

      await producer.disconnect();
    }
  }

  // Render a little Artist and Track Details using React
  render() {
    let card;

    //only display something if we have a song
    if (this.state.track !== null) {
      card = (
        <div className="grid">
          <h1 className="margin-top">{this.state.track.name}</h1>
          <h2>{this.state.track.artists[0].name}</h2>
          <img
            src={this.state.track.album.images[0].url}
            alt="music cover"
            className="corner-round-1 img-cover"
          />
        </div>
      );
    } else {
      card = <p hidden={true} />;
    }

    // Return the Website
    return (
      <div className="grid">
        <div className="search">
          <form>
            <label htmlFor="searchbar"></label>
            <input
              className="corner-round-1"
              type="text"
              name="search"
              id="searchbar"
              onChange={(value) => this.getSearchResults(value.target.value)}
            ></input>
          </form>
        </div>
        {card}
        <h1>{this.state.song}</h1>
        <footer>
          <button
            className="button-style button-control"
            type="button"
            onClick={() => this.prevSong()}
          >
            <svg role="img" height="16" width="16" viewBox="0 0 16 16">
              <path d="M3.3 1a.7.7 0 01.7.7v5.15l9.95-5.744a.7.7 0 011.05.606v12.575a.7.7 0 01-1.05.607L4 9.149V14.3a.7.7 0 01-.7.7H1.7a.7.7 0 01-.7-.7V1.7a.7.7 0 01.7-.7h1.6z"></path>
            </svg>
          </button>
          <button
            className="button-style button-control"
            type="button"
            onClick={() => this.playSongFromResult()}
          >
            <svg role="img" height="16" width="16" viewBox="0 0 16 16">
              <path d="M3 1.713a.7.7 0 011.05-.607l10.89 6.288a.7.7 0 010 1.212L4.05 14.894A.7.7 0 013 14.288V1.713z"></path>
            </svg>
          </button>
          <button
            className="button-style button-control"
            type="button"
            onClick={() => this.skipSong()}
          >
            <svg role="img" height="16" width="16" viewBox="0 0 16 16">
              <path d="M12.7 1a.7.7 0 00-.7.7v5.15L2.05 1.107A.7.7 0 001 1.712v12.575a.7.7 0 001.05.607L12 9.149V14.3a.7.7 0 00.7.7h1.6a.7.7 0 00.7-.7V1.7a.7.7 0 00-.7-.7h-1.6z"></path>
            </svg>
          </button>
        </footer>
        <div className="text-to-upper grid">
          <h1>NFC</h1>
          <div id="status" className="corner-round-1"></div>
          <div className="editing">
            <button className="button-style" type="button">
              Clear
            </button>
            <button
              className="button-style"
              type="button"
              onClick={() => this.writeToBroker()}
            >
              Write
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Setup;
