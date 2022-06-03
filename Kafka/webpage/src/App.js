import React, { useState, useEffect } from "react";
import Setup from "./Setup";
import Login from "./Login";
import "./App.css";

//Base React App
function App() {
  // State as token, changes when Login was success
  const [token, setToken] = useState("");

  // changes the state on Login
  useEffect(() => {
    async function getToken() {
      const response = await fetch("/auth/token");
      const json = await response.json();
      setToken(json.access_token);
    }

    getToken();
  }, []);

  // Return the Login Component when not logged-in
  // else return the Setup Component with the Token
  return <>{token === "" ? <Login /> : <Setup token={token} />}</>;
}

export default App;
