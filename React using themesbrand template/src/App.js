import React, { useEffect, useState } from 'react';
import {
    BrowserRouter as Router,
    Switch,
} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

// Import Routes
import { authProtectedRoutes } from "./routes/";
import AppRoute from "./routes/route";

// layouts
import VerticalLayout from "./components/VerticalLayout/";
import HorizontalLayout from "./components/HorizontalLayout/";

// Import scss
import "./assets/scss/theme.scss";
import 'react-toastify/dist/ReactToastify.css';

//-v 16.13.1
// import AWS from 'aws-sdk';
import Amplify, { Auth } from "aws-amplify";
import {
    Authenticator,
    ForgotPassword,
    ConfirmSignUp,
    Greetings,
    SignIn,
    SignUp,
} from 'aws-amplify-react';

import Register from "./pages/Authentication/Register";
import Login from "./pages/Authentication/Login";
import ForgetPassword from "./pages/Authentication/ForgetPassword";
import ConfirmRegister from './pages/Authentication/ConfirmRegister';

// Toast configuration
toast.configure({
    autoClose: 5000,
    draggable: false
});


Amplify.configure({
    identityPoolId: process.env.REACT_APP_AWS_IDENTITY_POOL_ID,
    region: process.env.REACT_APP_AWS_REGION,
    userPoolId: process.env.REACT_APP_AWS_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_AWS_USER_POOL_WEBCLIENT_ID,
    oauth: {
        domain: process.env.REACT_APP_AWS_OAUTH_DOMAIN,
        scope: [
            'id',
            'name',
            'full_name',
            'email',
            'openid',
            'profile',
            'public_profile',
            'aws.cognito.signin.user.admin',
        ],
        redirectSignIn: process.env.REACT_APP_AWS_REDIRECT_SIGNIN_URL,
        redirectSignOut: process.env.REACT_APP_AWS_REDIRECT_SIGNOUT_URL,
        responseType: 'token',
    },
});

const federated = {
    google_client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    facebook_app_id: process.env.REACT_APP_FACEBOOK_APP_ID,
};

const App = (props) => {
    const [user, setUser] = useState({});
    const Layout = props.layout;

    useEffect(() => {
        async function getUser() {
            await Auth.currentAuthenticatedUser({
                bypassCache: false,
            })
                .then((user) => {
                    setUser(user);
                })
                .catch(err => console.log(err));
        }

        getUser();
    }, [user]);

    if (props.authState === "signedIn") {
        return (
            <>
                <Router>
                    <Switch>
                        {authProtectedRoutes.map((route, idx) => (
                            <AppRoute
                                path={route.path}
                                layout={Layout}
                                component={route.component}
                                key={idx}
                                isAuthProtected={true}
                            />
                        ))}
                    </Switch>
                </Router>
            </>
        );
    } else {
        return null;
    }
}

class AppWithAuth extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.getLayout = this.getLayout.bind(this);
    }

    getLayout = () => {
        let layoutCls = VerticalLayout;
        return layoutCls;
    };
    render() {
        const Layout = this.getLayout();
        return (
            <React.Fragment>
                <ToastContainer />
                <Authenticator
                    federated={federated}
                    hide={
                        [
                            Greetings,
                            SignIn,
                            SignUp,
                            ConfirmSignUp,
                            ForgotPassword
                        ]
                    }
                >
                    <Login override={'SignIn'} />
                    <Register override={'SignUp'} signUpConfig={signUpConfig} />
                    <ConfirmRegister />
                    <ForgetPassword override={'forgotPassword'} />
                    <App layout={Layout} />
                    {/* <AuthGreating override={'authenticator'}/> */}
                </Authenticator>
            </React.Fragment>
        )
    }
}

const signUpConfig = {
    hideAllDefaults: true,
    signUpFields: [
        {
            label: 'Username',
            key: 'username',
            required: true,
            placeholder: 'Enter username',
            type: 'text',
            displayOrder: 1,
        },
        {
            label: 'Name',
            key: 'name',
            required: true,
            placeholder: 'Enter name',
            type: 'text',
            displayOrder: 2,
        },
        {
            label: 'Email',
            key: 'email',
            required: true,
            placeholder: 'Enter email',
            type: 'email',
            displayOrder: 3,
        },
        {
            label: 'Phone No.',
            key: 'phone_number',
            required: true,
            placeholder: 'Enter phone No.',
            type: 'text',
            displayOrder: 4,
        },
        {
            label: 'Password',
            key: 'password',
            required: true,
            placeholder: 'Enter password',
            type: 'password',
            displayOrder: 5,
        }
    ],
}

export default AppWithAuth;