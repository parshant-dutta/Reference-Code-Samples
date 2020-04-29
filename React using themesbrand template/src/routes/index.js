import React from "react";
import { Redirect } from "react-router-dom";

// Pages Calendar
import Calendar from "../pages/Calendar/index";

// Pages Price List
import PriceList from "../pages/Price/PriceList";
import Transactions from "../pages/Reports/Transactions";
import BalanceStatements from "../pages/Reports/BalanceStatements";

// Dashboard
import Dashboard from "../pages/Dashboard/index";
import Profile from "../pages/User/profile";
import APISetting from "../pages/TechDevelopment/APISetting";

const authProtectedRoutes = [
	{ path: "/dashboard", component: Dashboard },
	{ path: "/apisettings", component: APISetting },
	//calendar
	{ path: "/calendar", component: Calendar },
	//Price List
	{ path: "/price-list", component: PriceList },
	//Price List
	{ path: "/profile", component: Profile },
	//Reports pages
	{ path: "/reports/transactions", component: Transactions },
	{ path: "/reports/balance-statements", component: BalanceStatements },
	// this route should be at the end of all other routes
	{ path: "/", exact: true, component: () => <Redirect to="/reports/transactions" /> }
];

export {
	authProtectedRoutes
}