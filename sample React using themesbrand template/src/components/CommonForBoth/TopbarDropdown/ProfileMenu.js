
import React, { Component } from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { withRouter, Link } from 'react-router-dom';

// users
import user1 from '../../../assets/images/users/avatar-1.jpg';

class ProfileMenu extends Component {

    constructor(props) {
        super(props);
        this.state = {
            menu: false,
            userName: this.props.userDisplayname
        };
        this.username = this.props.username;
        this.logout = this.logout.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    componentWillReceiveProps(nextprops) {
        this.setState({
            username: nextprops.userDisplayname
        });
    }

    toggle() {
        this.setState(prevState => ({
            menu: !prevState.menu
        }));
    }
    logout() {
        this.props.logoutMenu();
    }
    render() {

        return (
            <React.Fragment>
                <Dropdown isOpen={this.state.menu} toggle={this.toggle} className="d-inline-block" >
                    <DropdownToggle className="btn header-item waves-effect" id="page-header-user-dropdown" tag="button">
                        <img className="rounded-circle header-profile-user" src={user1} alt="Header Avatar" />
                        <span className="d-none d-xl-inline-block ml-2 mr-1">{this.state.username !== undefined ? this.state.username : '~'}</span>
                        <i className="mdi mdi-chevron-down d-none d-xl-inline-block"></i>
                    </DropdownToggle>
                    <DropdownMenu right>
                        <Link to="/profile" className="dropdown-item">
                        <i className="bx bx-user font-size-16 align-middle mr-1"></i>
                            <span>Profile</span>
                        </Link>
                        <div className="dropdown-divider"></div>
                        <Link to="/" onClick={this.logout} className="dropdown-item">
                            <i className="bx bx-power-off font-size-16 align-middle mr-1 text-danger"></i>
                            <span>Logout</span>
                        </Link>
                    </DropdownMenu>
                </Dropdown>
            </React.Fragment>
        );
    }
}

export default withRouter(ProfileMenu);


