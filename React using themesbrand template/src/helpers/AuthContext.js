import React from 'react';
import axios from 'axios';

const AuthContext = React.createContext();

class AuthProvider extends React.Component {
  state = {
    isAuth: false,
    authData: {
      AuthenticationResult: {
        IdToken: ""
      }
    },
  };

  constructor() {
    super();

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  login(username, password) {
    axios({
      method: 'POST',
      url: process.env.REACT_APP_API_URL + '/token',
      data: {
        username: username,
        password: password,
      },
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(res => {
      if (res) {
        if (res.status === 200) {
          this.setState({
            isAuth: true,
            authData: res.data
          });
          localStorage.setItem('state', JSON.stringify(this.state));
        }
      }
    })
    .catch(e => {
      console.log(e);
    });
  }

  logout() {
    this.setState({ isAuth: false });

    localStorage.setItem('state', false);
  }

  componentDidMount() {
    const state = JSON.parse(localStorage.getItem('state'));
    this.setState({
      isAuth: state && state.isAuth ? true : false,
      authData: state && state.authData ? state.authData : {
        AuthenticationResult: {
          IdToken: ""
        }
      },
    });
  }

  render() {
    return (
      <AuthContext.Provider
        value={{ 
          isAuth: this.state.isAuth,
          authData: this.state.authData,
          login: this.login,
          logout: this.logout,
        }}
      >
        {this.props.children}
      </AuthContext.Provider>
    )
  }
}

const AuthConsumer = AuthContext.Consumer;

export { AuthProvider, AuthConsumer }