import React, { useEffect, useState } from 'react';

// import { useToasts } from 'react-toast-notifications';
import { Container, Row, Col, Card, CardBody, CardTitle, Alert } from "reactstrap";
import Breadcrumbs from '../../components/Common/Breadcrumb';
import AWS from 'aws-sdk';
import { Auth } from 'aws-amplify';
// import { Link } from "react-router-dom";

import "../../assets/scss/custom/pages/profile.scss";

import avatar1 from "../../assets/images/users/avatar-1.jpg";
import profileImg from "../../assets/images/profile-img.png";
import facebook from "../../assets/images/facebook.png";
import google from "../../assets/images/google.png";

const cognito = new AWS.CognitoIdentityServiceProvider({
    region: process.env.REACT_APP_AWS_REGION,
    credentials: new AWS.Credentials({
        accessKeyId: process.env.REACT_APP_COGNITO_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_COGNITO_SECRET_ACCESS_KEY,
    })
});

const INITIAL_STATE = {
    username: '',
    attributes: {
        name: '~',
        phone_number: '~',
        email: '~',
        identities: [],
    },
}

const Profile = () => {
    // let messagetype = "", message = "";
    const [messageObject, setMessage] = useState({ type: "", message: "" });
    const [user, setUser] = useState(INITIAL_STATE);

    const [fbUserId, setFB] = useState('');
    const [gaUserId, setGA] = useState('');

    const [fbChecked, setFBCheck] = useState(false);
    const [gaChecked, setGACheck] = useState(false);

    //   const { addToast } = useToasts();
    useEffect(() => {
        const fetchData = async () => {
            await Auth.currentAuthenticatedUser({
                bypassCache: true,
            })
                .then(user => {
                    setUser(user);

                    if (user.attributes && user.attributes.identities) {
                        let identities = JSON.parse(user.attributes.identities);

                        console.log(identities);

                        identities.map((identity, key) => {
                            switch (identity.providerType) {
                                case 'Facebook':
                                    setFB(identity.userId);
                                    setFBCheck(true);
                                    break;

                                case 'Google':
                                    setGA(identity.userId);
                                    setGACheck(true);
                                    break;

                                default:
                                    break;
                            }
                        });
                    }
                })
                .catch(error => {
                    setMessage({ type: "danger", message: "Error" + error.message });
                    clearMessage();
                    // addToast(error.message, { appearance: 'error', autoDismiss: true });
                });
        }

        fetchData();

        const ga = window.gapi && window.gapi.auth2 ?
            window.gapi.auth2.getAuthInstance() :
            null;

        if (!window.FB && !ga) createScript();
    }, []);

    const fbAsyncInit = () => {
        // init the fb sdk client
        const fb = window.FB;
        fb.init({
            appId: process.env.REACT_APP_FACEBOOK_APP_ID,
            cookie: true,
            xfbml: true,
            version: 'v2.11',
        });
    }

    const initFB = () => {
        const fb = window.FB;
    }

    const initGapi = () => {
        // init the Google SDK client
        const g = window.gapi;
        g.load('auth2', function () {
            g.auth2.init({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                // authorized scopes
                scope: 'profile email openid'
            });
        });
    }

    const createScript = () => {
        window.fbAsyncInit = fbAsyncInit;
        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.onload = initFB;
        document.body.appendChild(script);

        const script2 = document.createElement('script');
        script2.src = 'https://apis.google.com/js/platform.js';
        script2.async = true;
        script2.onload = initGapi;
        document.body.appendChild(script2);
    }

    const linkFB = () => {
        setFBCheck(true);

        const fb = window.FB;
        fb.getLoginStatus(response => {
            if (response.status === 'connected') {
                // console.log(user.username);
                // console.log(response.authResponse.userID);

                cognito.adminLinkProviderForUser({
                    DestinationUser: {
                        ProviderAttributeValue: user.username,
                        ProviderName: 'Cognito',
                    },
                    SourceUser: {
                        ProviderAttributeName: 'Cognito_Subject',
                        ProviderAttributeValue: response.authResponse.userID,
                        ProviderName: 'Facebook',
                    },
                    UserPoolId: process.env.REACT_APP_AWS_USER_POOL_ID,
                }, function (error, data) {
                    if (error) {
                        console.log(error, error.stack);
                        setMessage({ type: "danger", message: "Error" + error.message });
                        clearMessage();
                        // addToast(error.message, { appearance: 'error', autoDismiss: true });

                        setFBCheck(false);
                    } else {
                        console.log(data);
                        // messagetype = "success";
                        // message = 'Successfully link to your Facebook account';
                        setMessage({ type: "success", message: 'Successfully link to your Facebook account' });
                        clearMessage();
                        // addToast('Successfully link to your Facebook account', { appearance: 'success' });
                    }
                });
            } else {
                setMessage({ type: "danger", message: 'Could not connect to Facebook' });
                // messagetype = "danger";
                // message = 'Could not connect to Facebook';
                clearMessage();
                // addToast('Could not connect to Facebook', { appearance: 'error', autoDismiss: true });

                setFBCheck(false);
            }
        });
    }

    const unlinkFB = () => {
        setFBCheck(false);

        cognito.adminDisableProviderForUser({
            User: {
                ProviderAttributeName: 'Cognito_Subject',
                ProviderAttributeValue: fbUserId,
                ProviderName: 'Facebook',
            },
            UserPoolId: process.env.REACT_APP_AWS_USER_POOL_ID,
        }, function (error, data) {
            if (error) {
                console.log(error, error.stack);
                setMessage({ type: "danger", message: "Error" + error.message });
                clearMessage();
                // addToast(error.message, { appearance: 'error', autoDismiss: true });

                setFBCheck(true);
            } else {
                console.log(data);
                // messagetype = "success";
                // message = 'Unlink successfully';
                setMessage({ type: "success", message: 'Unlink successfully' });
                clearMessage();
                // addToast('Unlink successfully', { appearance: 'success' });
            }
        });
    }

    const linkGA = () => {
        setGACheck(true);

        const ga = window.gapi.auth2.getAuthInstance();

        ga.signIn().then(
            googleUser => {
                const profile = googleUser.getBasicProfile();

                cognito.adminLinkProviderForUser({
                    DestinationUser: {
                        ProviderAttributeValue: user.username,
                        ProviderName: 'Cognito',
                    },
                    SourceUser: {
                        ProviderAttributeName: 'Cognito_Subject',
                        ProviderAttributeValue: profile.getId(),
                        ProviderName: 'Google',
                    },
                    UserPoolId: process.env.REACT_APP_AWS_USER_POOL_ID,
                }, function (error, data) {
                    if (error) {
                        console.log(error, error.stack);
                        setMessage({ type: "danger", message: "Error" +  error.message });
                        clearMessage();
                        // addToast(error.message, { appearance: 'error', autoDismiss: true });

                        setGACheck(false);
                    } else {
                        console.log(data);
                        setMessage({ type: "success", message: 'Successfully link to your Google account' });
                        clearMessage();
                        // addToast('Successfully link to your Google account', { appearance: 'success' });
                    }
                });

            },
            error => {
                console.log(error);
                setMessage({ type: "danger", message: "Error" + error.message });
                clearMessage();
                // addToast(error.message, { appearance: 'error', autoDismiss: true });
            }
        );
    }

    const unlinkGA = () => {
        setGACheck(false);

        cognito.adminDisableProviderForUser({
            User: {
                ProviderAttributeName: 'Cognito_Subject',
                ProviderAttributeValue: gaUserId,
                ProviderName: 'Google',
            },
            UserPoolId: process.env.REACT_APP_AWS_USER_POOL_ID,
        }, function (error, data) {
            if (error) {
                console.log(error, error.stack);
                setMessage({ type: "danger", message: "Error" + error.message });
                clearMessage();
                // addToast(error.message, { appearance: 'error', autoDismiss: true });

                setGACheck(true);
            } else {
                console.log(data);
                setMessage({ type: "success", message: 'Unlink successfully' });
                clearMessage();
                // addToast('Unlink successfully', { appearance: 'success' });
            }
        });
    }
    const clearMessage = () => {
        setTimeout(() => {
            setMessage({ type: "", message: "" });
        }, 5000);
    }

    const { type, message } = messageObject;
    return (
        <React.Fragment>

            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="" breadcrumbItem="Profile" />
                    <Row>
                        <Col lg="5">
                            <Card className="overflow-hidden profileCard">
                                <div className="bg-soft-primary">
                                    <Row>
                                        <Col xs="7">
                                            <div className="text-primary p-3">
                                                <h5 className="text-primary">Welcome Back !</h5>
                                                <p>IIMMPACT user profile</p>
                                            </div>
                                        </Col>
                                        <Col xs="5" className="align-self-end">
                                            <img src={profileImg} alt="" className="img-fluid" />
                                        </Col>
                                    </Row>
                                </div>
                                <CardBody className="pt-0">
                                    <Row>
                                        <Col sm="4">
                                            <div className="avatar-md profile-user-wid mb-4">
                                                <img src={avatar1} alt="" className="img-thumbnail rounded-circle" />
                                            </div>
                                            <h5 className="font-size-15 text-truncate">{user.attributes.name}</h5>
                                            <p className="text-muted mb-0 text-truncate">{user.username}</p>
                                        </Col>

                                        <Col sm="8">
                                            <div className="pt-4">
                                                <Row>
                                                    <Col >
                                                        <p className="text-muted mb-0">Phone Number</p>
                                                        <h5 className="font-size-15">{user.attributes.phone_number}</h5>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col >
                                                        <p className="text-muted mb-0">Email</p>
                                                        <h5 className="font-size-15">{user.attributes.email}</h5>
                                                    </Col>
                                                </Row>
                                            </div>
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col lg="7">
                            <Card className="profileCard">
                                <CardBody>
                                    <CardTitle>Social Accounts</CardTitle>
                                    <div className="alertMessage">
                                        <Alert color={type}>{message}</Alert>
                                    </div>
                                    <ul className="list-unstyled media-list-divider">
                                        <li className="media py-3 align-items-center">
                                            {/* <i className="fab fa-facebook-f"></i> */}
                                            <span className="btn btn-sm btn-facebook btn-floating mr-3">
                                            <img src={facebook} alt="" height="40" width="40" className="mr-2"></img>
                                            </span>
                                            <div className="media-body flexbox">
                                                <div>
                                                    <h5 className="font-size-15">Facebook</h5>
                                                    <p className="text-muted mb-0">
                                                        {fbUserId !== '' ? 'Linked' : 'Not linked'}
                                                    </p>
                                                </div>
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={fbChecked}
                                                        onClick={fbUserId === '' ? linkFB : unlinkFB}
                                                    />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                        </li>
                                        <li className="media py-3 align-items-center">
                                            <span className="btn btn-sm btn-google btn-floating mr-3">
                                                {/* <i className="fab fa-google-plus-g"></i> */}
                                                <img src={google} alt="" height="40" width="40" className="mr-2"></img>
                                            </span>
                                            <div className="media-body flexbox">
                                                <div>
                                                    <h5 className="font-size-15">Google</h5>
                                                    <p className="text-muted mb-0">
                                                        {gaUserId !== '' ? 'Linked' : 'Not linked'}
                                                    </p>
                                                </div>
                                                <label className="switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={gaChecked}
                                                        onClick={gaUserId === '' ? linkGA : unlinkGA}
                                                    />
                                                    <span className="slider round"></span>
                                                </label>
                                            </div>
                                        </li>
                                    </ul>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    )
}

export default Profile;