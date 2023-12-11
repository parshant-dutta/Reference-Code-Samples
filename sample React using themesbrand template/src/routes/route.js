import React, { useEffect, useRef, useState } from 'react';
import { Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import IntlTelInput from 'react-intl-tel-input';

import { Auth } from 'aws-amplify';
import { Modal } from 'react-bootstrap';

import { SuccessToast, ErrorToast, InfoToast } from '../Utils/toaster';

const PNF = require('google-libphonenumber').PhoneNumberFormat;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

function useInterval(callback, delay) {
	const savedCallback = useRef();

	// Remember the latest callback.
	useEffect(() => {
		savedCallback.current = callback;
	}, [callback]);

	// Set up the interval.
	useEffect(() => {
		function tick() {
			savedCallback.current();
		}

		if (delay !== null) {
			let id = setInterval(tick, delay);
			return () => clearInterval(id);
		}
	}, [delay]);
}

const AppRoute = ({
	component: Component,
	layout: Layout,
	isAuthProtected,
	...rest
}) => {
	const [user, setUser] = useState({});
	const [defaultCountry] = useState('my');
	const [phoneNumber, setPhoneNumber] = useState();
	const [isPhoneNumberVerified, setPhoneNumberVerified] = useState(true);
	const [verificationCodeSent, setVerificationCodeSent] = useState(false);
	const [verificationCode, setVerificationCode] = useState('');
	const [countdown, setCountdown] = useState(30);

	const history = createBrowserHistory();
	useEffect(() => {
		async function getUser() {
			await Auth.currentAuthenticatedUser({
				bypassCache: true,
			})
				.then((user) => {
					setUser(user);
					let { phone_number, phone_number_verified } = user.attributes;

					setPhoneNumber(phone_number);
					setPhoneNumberVerified(phone_number_verified);
				})
				.catch(err => console.log(err));
				
		}

		getUser();

	}, []);


	useInterval(() => {
		if (verificationCodeSent && countdown) {
			setCountdown(countdown => countdown - 1);
		}
	}, 1000);

	const handleLogout = () => {
		Auth.signOut({ global: true })
			.then(data => {
				history.push('/');
			})
			.catch(err => {
				console.log(err)
			});
	}

	const verify = async () => {
		let user = await Auth.currentAuthenticatedUser({
			bypassCache: true,
		});

		let { phone_number, phone_number_verified } = user.attributes;

		setPhoneNumber(phone_number);
		setPhoneNumberVerified(phone_number_verified);

		if (phoneNumber.length && phone_number !== phoneNumber) {
			let result = await Auth.updateUserAttributes(user, {
				'phone_number': phoneNumber,
			});

			if (result === 'SUCCESS') {
				setPhoneNumber(phoneNumber);
			} else {
				ErrorToast(result);
				// addToast(result, {appearance: 'Error updating phone number', autoDismiss: true});
			}
		}

		if (!verificationCodeSent) {
			await Auth.verifyCurrentUserAttribute('phone_number')
				.then(() => {
					setVerificationCodeSent(true);
					setCountdown(30);
					InfoToast('Verification code has been sent to ' + phoneNumber);
					// addToast('Verification code has been sent to ' + phoneNumber, {
					//     appearance: 'info',
					//     autoDismiss: true
					// });
				}).catch((e) => {
					ErrorToast(e.message);
					// addToast(e.message, {appearance: 'error', autoDismiss: true});
				});
		} else {
			await Auth.verifyCurrentUserAttributeSubmit('phone_number', verificationCode)
				.then(() => {
					SuccessToast('Phone number has been verified!');
					// addToast('Phone number has been verified!', {appearance: 'success', autoDismiss: true});

					setPhoneNumberVerified(true);
				}).catch(e => {
					ErrorToast(e.message);
					// addToast(e.message, {appearance: 'error', autoDismiss: true});
				});

			user = await Auth.currentAuthenticatedUser({
				bypassCache: true,
			});

			let currentSession = user.signInUserSession;

			user.refreshSession(currentSession.refreshToken, (err, session) => {
				// do something with the new session
			});
		}
	}

	const resendCode = async () => {
		await Auth.verifyCurrentUserAttribute('phone_number')
			.then(() => {
				setVerificationCodeSent(true);
				setCountdown(30);
				InfoToast('Verification code has been sent to ' + phoneNumber);
				// addToast('Verification code has been sent to ' + phoneNumber, {appearance: 'info', autoDismiss: true});
			}).catch((e) => {
				ErrorToast(e.message);
				// addToast(e.message, {appearance: 'error', autoDismiss: true});
			});
	}
const userDisplayName = user.attributes && user.attributes.name ? user.attributes.name : user.username;
	return (
		<>
			<Route
				{...rest}
				render={props => {
					return (
						<Layout username={userDisplayName} logout={handleLogout} >
							<Component {...props} />
						</Layout>
					);
				}
				}
			/>
			<Modal show={!isPhoneNumberVerified} onHide={() => {
			}}>
				<Modal.Header>
					<Modal.Title>Phone Number Verification</Modal.Title>
				</Modal.Header>
				<Modal.Body style={{ margin: "0 auto" }}>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							verify();
						}}
						style={{ paddingBottom: "1em" }}
					>
						<div className="input-group">
							{!verificationCodeSent ?
								<IntlTelInput
									defaultCountry={defaultCountry}
									preferredCountries={['my', 'id']}
									containerClassName="intl-tel-input"
									inputClassName="form-control"
									separateDialCode={true}
									onPhoneNumberChange={(valid, phone, country) => {
										try {
											const number = phoneUtil.parseAndKeepRawInput(phone, country.iso2);
											setPhoneNumber(phoneUtil.format(number, PNF.E164));
										} catch (error) {
											console.log(error.message);
										}
									}}
									onSelectFlag={(phone, country) => {
										try {
											const number = phoneUtil.parseAndKeepRawInput(phone, country.iso2);
											setPhoneNumber(phoneUtil.format(number, PNF.E164));
										} catch (error) {
											console.log(error.message);
										}
									}}
									style={{ width: "300px" }}
								/>
								:
								<input
									className="form-control"
									type="text"
									value={verificationCode}
									onChange={(e) => {
										setVerificationCode(e.target.value);
									}}
									required
									style={{ width: '300px' }}
								/>
							}
							<div className="input-group-append">
								<button className="btn btn-primary" type="submit">
									{!verificationCodeSent ? 'SEND CODE' : 'VERIFY'}
								</button>
							</div>
						</div>
					</form>

					<div style={{ textAlign: 'center' }}>
						<button
							className="btn link btn-sm"
							onClick={resendCode}
							disabled={verificationCodeSent && countdown === 0 ? false : true}
						>
							Resend Code ({countdown})
                        </button>

						<br />

						<button
							className="btn link btn-sm"
							onClick={handleLogout}
						>
							Logout
                        </button>
					</div>
				</Modal.Body>
			</Modal>
		</>
	)
}

export default AppRoute;