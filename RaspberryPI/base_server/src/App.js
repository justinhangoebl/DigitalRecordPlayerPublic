import React, { useState, useEffect } from "react";
import Setup from "./Setup.jsx";
import Login from "./Login.js";
import "./App.css";

//Base React App
function App() {
  // State as token, changes when Login was success
  const [token, setToken] = useState("");
  // State as id, because we want to change it on run time, from NFC
  const [nfc_ready, setNFCState] = useState("")

  // changes the state on Login and the state of the id in case we try to play using NFC
  useEffect(() => {
    async function getToken() {
      const response = await fetch("/auth/token");
      const json = await response.json();
      setToken(json.access_token);
    }

    async function getId(){
      const response = await fetch("/nfc_ready");
      const json = await response.json();
      setNFCState(json.nfc_ready);
    }

    getToken();
    getId()
  }, []);

  // Return the Login Component when not logged-in
  // else return the Setup Component with the Token
  return <>{token === "" ? <Login /> : <Setup token={token} nfc_ready={nfc_ready}/>}</>;
}

export default App;
