import React, { useState } from 'react';
import Auth from '@aws-amplify/auth';
import { ConfirmSignUp } from 'aws-amplify-react';
import { Container, Toast } from 'aws-amplify-react/dist/Amplify-UI/Amplify-UI-Components-React';
import { Row, Col, Alert, Card, CardBody } from "reactstrap";

// Redux
import { connect } from "react-redux";
import { withRouter, Link } from "react-router-dom";

// availity-reactstrap-validation
import { AvForm, AvField } from "availity-reactstrap-validation";

// import images
import profile from "../../assets/images/profile-img.png";
import logo from "../../assets/images/logo.png";

export class ConfirmRegister extends ConfirmSignUp {
  constructor(props) {
    super(props);

    this.state = {
      initiateCountdown: false,
      countdown: 0,
    }
  }

  confirm() {
    const username = this.usernameFromAuthData() || this.inputs.username;
    const { code } = this.inputs;
    if (!Auth || typeof Auth.confirmSignUp !== 'function') {
      throw new Error(
        'No Auth module found, please ensure @aws-amplify/auth is imported'
      );
    }

    Auth.confirmSignUp(username, code)
      .then(() => {
        this.changeState('signedUp');

        this.setState({
          errorMessage: 'Thanks! Your account has been created successfully',
          showToast: true,
        });
      })
      .catch(err => this.error(err));
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      if (this.state.initiateCountdown) {
        if (this.state.countdown > 0) {
          this.setState({
            countdown: this.state.countdown - 1
          });
        } else {
          this.setState({
            initiateCountdown: false,
          })
        }
      }
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  showComponent(theme) {
    const username = this.usernameFromAuthData();

    return (
      <React.Fragment>
        {this.state.showToast && (
          <Toast
            onClose={() => this.setState({ showToast: false })}
          >
            {this.state.errorMessage}
          </Toast>
        )}

        <div className="account-pages my-4 pt-sm-2">
          <div className="container">
            <Row className="justify-content-center">
              <Col md={8} lg={6} xl={5}>
                <Card className="overflow-hidden">
                  <div className="bg-soft-secondary">
                    <Row>
                      <Col className="col-7">
                        <div className="text-primary p-4">
                          <h5 className="text-primary"> Welcome Back !</h5>
                          <p>Verify to continue to IIMMPACT.</p>
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
                        onValidSubmit={(e) => {
                          e.preventDefault();
                          this.confirm();
                        }}>

                        {this.props.error && this.props.error ? <Alert color="danger">{this.props.error}</Alert> : null}
                        <div className="form-group">
                          <AvField
                            type="text"
                            id="username"
                            label="Username" 
                            key="username"
                            placeholder="Enter username"
                            name="username"
                            onChange={this.handleInputChange}
                            disabled
                            value={username ? username : ''}
                            required />
                        </div>

                        <div className="form-group">
                          <AvField
                            type="text"
                            label="Code" 
                            placeholder="Enter code"
                            id="code"
                            key="code"
                            name="code"
                            onChange={this.handleInputChange}
                            required />
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <Link
                              className="btn btn-link"
                              type="button"
                              href="/"
                              onClick={(e) => {
                                e.preventDefault();
                                this.resend();

                                if (this.state.countdown > 0) {
                                  return;
                                }

                                this.setState({
                                  initiateCountdown: true,
                                  countdown: 30,
                                });
                              }}
                              className={this.state.countdown === 0 ? 'btn-link' : 'btn-link disabled'}
                              disabled={this.state.countdown === 0 ? false : true}
                            >
                              Resend code ({this.state.countdown})
                          </Link>
                          </div>
                          <div className="col-md-6">
                            <Col className="text-right">
                              <button className="btn btn-primary w-md waves-effect waves-light" type="submit">SUBMIT</button>
                            </Col>
                          </div>
                        </div>
                      </AvForm>
                    </div>
                  </CardBody>
                </Card>
                <div className="mt-5 text-center">
                  <p>
                    Go back to{" "}
                    <Link  to="/" onClick={(e) => { e.preventDefault(); this.changeState('signIn') }} className="font-weight-medium text-primary"> Sign In </Link>
                  </p>
                  <p>© {new Date().getFullYear()} IIMMPACT SDN BHD</p>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default ConfirmRegister;