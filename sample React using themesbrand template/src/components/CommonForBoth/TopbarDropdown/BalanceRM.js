import React, { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';
import API from '../../../Utils/api';

const BalanceRM = () => {
    const [balance, setBalance] = useState('~');

    useEffect(() => {
        Auth.currentSession()
            .then(data => {
                API.defaults.headers.common['Authorization'] = data.getIdToken().getJwtToken();

                API.get('balance')
                    .then((response) => {
                        setBalance(response.data.data.balance);
                    })
                    .catch(error => console.log(error));
            })
            .catch(error => console.log(error));
    }, [])

    return (
        <React.Fragment>
            <div className="d-inline-block dropdown">
                <li className="btn header-item noti-icon waves-effect balancerm">
                    Balance: RM {balance}
                </li>
            </div>
        </React.Fragment>
    )
}

export default BalanceRM;