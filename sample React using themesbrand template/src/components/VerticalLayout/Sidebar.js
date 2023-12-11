import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { } from "../../store/actions";

// MetisMenu
import MetisMenu from "metismenujs";
import SimpleBar from "simplebar-react";

import { Link } from "react-router-dom";

const SidebarContent = props => {
    return (
        <>
            <div id="sidebar-menu">
                <ul className="metismenu list-unstyled" id="side-menu">
                    <li className="menu-title">Menu</li>
                    {/* <li>
                        <Link to="/dashboard" className="waves-effect">
                            <i className="bx bx-home-circle"></i><span className="badge badge-pill badge-info float-right">3</span>
                            <span>Dashboard</span>
                        </Link>
                    </li>

                    <li className="menu-title">Apps</li> */}

                    <li>
                        <Link to="/#" className="has-arrow waves-effect">
                            <i className="bx bx-store"></i>
                            <span>Reports</span>
                        </Link>
                        <ul className="sub-menu" aria-expanded="false">
                            <li><Link to="/reports/transactions">Transactions</Link></li>
                            <li><Link to="/reports/balance-statements">Balance Statements</Link></li>
                        </ul>
                    </li>
                    <li>
                        <Link to="/#" className="has-arrow waves-effect">
                            <i className="bx bx-file"></i>
                            <span>Tech Development</span>
                        </Link>
                        <ul className="sub-menu" aria-expanded="false">
                            <li><Link to="/apisettings">API Settings</Link></li>
                        </ul>
                    </li>
                    <li>
                        <Link to="/price-list" className=" waves-effect">
                            <i className="bx bx-list-ul"></i>
                            <span>Price List</span>
                        </Link>
                    </li>
                </ul>
            </div>
        </>
    )
};


class Sidebar extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    componentDidMount() {
        this.initMenu();
    }

    componentDidUpdate(prevProps) {
        if (this.props.type !== prevProps.type) {
            this.initMenu();
        }
    }

    initMenu() {
            new MetisMenu("#side-menu");

            var matchingMenuItem = null;
            var ul = document.getElementById("side-menu");
            var items = ul.getElementsByTagName("a");
            for (var i = 0; i < items.length; ++i) {
                if (this.props.location.pathname === items[i].pathname) {
                    matchingMenuItem = items[i];
                    break;
                }
            }
            if (matchingMenuItem) {
                this.activateParentDropdown(matchingMenuItem);
            }
    }

    activateParentDropdown = item => {
        item.classList.add("active");
        const parent = item.parentElement;

        if (parent) {
            parent.classList.add("mm-active");
            const parent2 = parent.parentElement;

            if (parent2) {
                parent2.classList.add("mm-show");

                const parent3 = parent2.parentElement;

                if (parent3) {
                    parent3.classList.add("mm-active"); // li
                    parent3.childNodes[0].classList.add("mm-active"); //a
                    const parent4 = parent3.parentElement;
                    if (parent4) {
                        parent4.classList.add("mm-active");
                    }
                }
            }
            return false;
        }
        return false;
    };

    render() {
        return (
            <React.Fragment>
                <div className="vertical-menu">
                    <div data-simplebar className="h-100">
                        {this.props.type !== "condensed" ? (
                            <SimpleBar style={{ maxHeight: "100%" }}>
                                <SidebarContent />
                            </SimpleBar>
                        ) : <SidebarContent />}
                    </div>

                </div>
            </React.Fragment>
        );
    }
}

const mapStatetoProps = state => {
    return {
        layout: state.Layout
    };
};
export default connect(mapStatetoProps, {})(withRouter(Sidebar));
