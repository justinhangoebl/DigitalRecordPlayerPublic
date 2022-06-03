import React from 'react';

// Login Page, just a Button that redirects to the Spotify API Login
function Login() {
    return (
        <div className="grid center-object">
                <form action="/auth/login">
                <button className='button-style' id="login-button">
                    Login with Spotify 
                </button>
                </form>
        </div>
    );
}

export default Login;