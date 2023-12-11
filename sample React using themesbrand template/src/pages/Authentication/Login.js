import React, { Component } from 'react';

import { Row, Col, CardBody, Card, Alert } from "reactstrap";

import { Link } from 'react-router-dom';

// availity-reactstrap-validation
import { AvForm, AvField } from 'availity-reactstrap-validation';

import 'react-intl-tel-input/dist/main.css';

import { Auth } from 'aws-amplify';
import { SignIn } from "aws-amplify-react";

import profile from "../../assets/images/profile-img.png";
import logo from "../../assets/images/logo.png";
import facebook from "../../assets/images/facebook.png";
import google from "../../assets/images/google.png";

class Login extends SignIn {

    constructor(props) {
        super(props);
        this.state = {}
        this._validAuthStates = ['signIn', 'signedOut', 'signedUp'];
        // handleValidSubmit
        this.handleValidSubmit = this.handleValidSubmit.bind(this);
    }

    // handleValidSubmit
    handleValidSubmit(event, values) {
        this.props.loginUser(values, this.props.history);
    }
    getHash() {
        let hashes = [];
        
        if (window.location.hash) {
          window.location.hash.split('&').forEach((v, i) => {
            let s = v.split('=');
            let k = s[0].replace('#', '');
            let w = decodeURIComponent(s[1].replace(/\+/g, ' '));
    
            hashes[k] = w;
          });
        }
        return hashes;
      }
    
      componentDidMount() {
        let hashes = this.getHash();
    
        if (hashes.error_description) {
          if (hashes.error_description.includes('Already found an entry for username')) {
            hashes.error_description = 'Account successfully linked, please re-logged in';
          }
    
        //   this.setState({
        //     errorMessage: hashes.error_description,
        //     showToast: true,
        //   });
        }
      }

      handleValidSubmit = async (event) => {
        event.preventDefault();
          let resp = await super.signIn();
      }

    showComponent(theme) {

        return (
            <React.Fragment>
                <div className="account-pages my-4 pt-sm-2">
                    <div className="container">
                        <Row className="justify-content-center">
                            <Col md={8} lg={6} xl={5}>
                                <Card className="overflow-hidden">
                                    <div className="bg-soft-secondary">
                                        <Row>
                                            <Col className="col-7">
                                                <div className="text-primary p-3">
                                                    <h5 className="text-primary"> Welcome Back !</h5>
                                                    <p>Sign In to continue to IIMMPACT.</p>
                                                </div>
                                            </Col>
                                            <Col className="col-5 align-self-end">
                                                <img src={profile} alt="" className="img-fluid" />
                                            </Col>
                                        </Row>
                                    </div>
                                    <CardBody className="pt-0">
                                        <div>
                                            <Link to="/">
                                                <div className="avatar-md profile-user-wid mb-4">
                                                    <span className="avatar-title rounded-circle bg-light">
                                                        <img src={logo} alt="" className="rounded-circle" height="70"></img>
                                                    </span>
                                                </div>
                                            </Link>
                                        </div>
                                        <div className="p-2">
                                        {/* onValidSubmit={this.handleValidSubmit} */}
                                            <AvForm className="form-horizontal" 
                                            onValidSubmit={(e) => this.handleValidSubmit(e)}>

                                                {this.props.error && this.props.error ? <Alert color="danger">{this.props.error}</Alert> : null}

                                                <div className="form-group">
                                                    <AvField id="username" key="username" name="username" onChange={this.handleInputChange} label="Username" className="form-control" placeholder="Enter username" type="text" required />
                                                </div>

                                                <div className="form-group">
                                                    <AvField id="password" key="password" name="password" onChange={this.handleInputChange} label="Password" type="password" required placeholder="Enter password" />
                                                </div>
                                                <div className="mt-3">
                                                    <button className="btn btn-primary btn-block waves-effect waves-light" type="submit">Sign In</button>
                                                </div>

                                                <div className="mt-4 text-center">
                                                    <Link to="/" onClick={(e) => {e.preventDefault(); this.changeState('forgotPassword')}} className="text-muted"> <i className="mdi mdi-lock mr-1"></i> Forgot password?</Link>
                                                </div>
                                            </AvForm>
                                        </div>
                                        <p className="mt-1 mb-2 text-muted text-center">OR</p>

                                        <div style={{ textAlign: "center" }}>
                                        <button id="google-signin-button" type="button" className="css-1graipa"  onClick={() => Auth.federatedSignIn({ provider: 'Google' })}>
                                                <span className="css-1vqao0l">
                                                    <span className="css-t5emrf">
                                                        <img src={google} alt="" height="20" width="20" className="mr-2"></img>
                                                        <span>Continue with Google</span>
                                                    </span>
                                                </span>
                                            </button>
                                            <button id="google-signin-button" type="button" className="css-1graipa"  onClick={() => Auth.federatedSignIn({ provider: 'Facebook' })}>
                                                <span className="css-1vqao0l">
                                                    <span className="css-t5emrf">
                                                        <img src={facebook} alt="" height="20" width="20" className="mr-2"></img>
                                                        <span>Continue with Facebook</span>
                                                    </span>
                                                </span>
                                            </button>
                                        </div>
                                    </CardBody>
                                </Card>
                                <div className="text-center">
                                    <p>Don't have an account ? <Link to="/" onClick={(e) => { e.preventDefault(); this.changeState('signUp') }} className="font-weight-medium text-primary"> Sign Up now </Link> </p>
                                    <p>{new Date().getFullYear()} ©  IIMMPACT SDN BHD</p>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}

export default Login;
// export default withRouter(connect(mapStatetoProps, { loginUser,apiError })(Login));

