import React, { Component } from "react";

import { connect } from "react-redux";

import { Link } from "react-router-dom";

// Import menuDropdown
import NotificationDropdown from "../CommonForBoth/TopbarDropdown/NotificationDropdown";
import ProfileMenu from "../CommonForBoth/TopbarDropdown/ProfileMenu";
import BalanceRM from "../CommonForBoth/TopbarDropdown/BalanceRM";

// import images
import logo from "../../assets/images/logo.png";
import iimmpact from "../../assets/images/iimmpact.png";

// Redux Store
import { toggleRightSidebar } from "../../store/actions";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSearch: false,
      userDisplayname: this.props.usernameCallback
    };
    this.logoutMenu = this.logoutMenu.bind(this);
    this.toggleMenu = this.toggleMenu.bind(this);
    this.toggleRightbar = this.toggleRightbar.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
  }


  componentWillReceiveProps(nextprops) {
    this.setState({
      userDisplayname: nextprops.usernameCallback
    });
  }
  /**
   * Toggle sidebar
   */
  toggleMenu() {
    this.props.toggleMenuCallback();
  }

  logoutMenu() {
    this.props.logoutCallback();
  }

  /**
   * Toggles the sidebar
   */
  toggleRightbar() {
    this.props.toggleRightSidebar();
  }


  toggleFullscreen() {
    if (
      !document.fullscreenElement &&
      /* alternative standard method */ !document.mozFullScreenElement &&
      !document.webkitFullscreenElement
    ) {
      // current working methods
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen(
          Element.ALLOW_KEYBOARD_INPUT
        );
      }
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
    }
  }

  render() {
    return (
      <React.Fragment>
        <header id="page-topbar">
          <div className="navbar-header">
            <div className="d-flex">
              <div className="navbar-brand-box">
                <Link to="/" className="logo logo-dark">
                  <span className="logo-sm">
                    <img src={logo} alt="" height="30" />
                  </span>
                  <span className="logo-lg">
                    <img src={iimmpact} alt="" height="32" />
                  </span>
                </Link>

                <Link to="/" className="logo logo-light">
                  <span className="logo-sm">
                    <img src={logo} alt="" height="30" />
                  </span>
                  <span className="logo-lg">
                    <img src={iimmpact} alt="" height="36" />
                  </span>
                </Link>
              </div>

              <button type="button" onClick={this.toggleMenu} className="btn btn-sm px-3 font-size-16 header-item waves-effect" id="vertical-menu-btn">
                <i className="fa fa-fw fa-bars"></i>
              </button>

            </div>
            <div className="d-flex">
              <div className="dropdown d-inline-block d-lg-none ml-2">
                <button onClick={() => { this.setState({ isSearch: !this.state.isSearch }); }} type="button" className="btn header-item noti-icon waves-effect" id="page-header-search-dropdown">
                  <i className="mdi mdi-magnify"></i>
                </button>
                <div className={this.state.isSearch ? "dropdown-menu dropdown-menu-lg dropdown-menu-right p-0 show" : "dropdown-menu dropdown-menu-lg dropdown-menu-right p-0"}
                  aria-labelledby="page-header-search-dropdown">

                  <form className="p-3">
                    <div className="form-group m-0">
                      <div className="input-group">
                        <input type="text" className="form-control" placeholder="Search ..." aria-label="Recipient's username" />
                        <div className="input-group-append">
                          <button className="btn btn-primary" type="submit"><i className="mdi mdi-magnify"></i></button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="dropdown d-none d-lg-inline-block ml-1">
                <button type="button" onClick={this.toggleFullscreen} className="btn header-item noti-icon waves-effect" data-toggle="fullscreen">
                  <i className="bx bx-fullscreen"></i>
                </button>
              </div>

              <NotificationDropdown />
              <BalanceRM />
              <ProfileMenu userDisplayname={this.state.userDisplayname} logoutMenu={this.logoutMenu} />

              {/* <div onClick={this.toggleRightbar} className="dropdown d-inline-block">
                <button type="button" className="btn header-item noti-icon right-bar-toggle waves-effect">
                  <i className="bx bx-cog bx-spin"></i>
                </button>
              </div> */}

            </div>
          </div>
        </header>
      </React.Fragment>
    );
  }
}

const mapStatetoProps = state => {
  const { layoutType } = state.Layout;
  return { layoutType };
};

export default connect(mapStatetoProps, { toggleRightSidebar })(Header);
