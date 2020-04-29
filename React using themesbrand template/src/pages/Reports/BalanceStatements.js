import React, { useEffect, useState, Component } from 'react';

import { Container, Row, Col, Card, CardBody, CardTitle, Alert } from 'reactstrap';

// RangeSlider
import "nouislider/distribute/nouislider.css";
//Import Breadcrumb
import Breadcrumbs from '../../components/Common/Breadcrumb';

import AWS from 'aws-sdk';
import { Auth } from 'aws-amplify';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import BootstrapTable from 'react-bootstrap-table-next';
// import paginationFactory from 'react-bootstrap-table2-paginator';
import paginationFactory, {
    PaginationProvider,
    PaginationTotalStandalone
} from 'react-bootstrap-table2-paginator';
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.css";
import moment from 'moment';
import DateTime from 'react-datetime';
import "react-datetime/css/react-datetime.css";

import "react-datepicker/dist/react-datepicker.css";
import API from '../../Utils/api';
import {ValidateDate} from '../Utility/ValidateDate';

import { SuccessToast, ErrorToast } from '../../Utils/toaster';

AWS.config.update({
    region: process.env.REACT_APP_AWS_REGION,
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: process.env.REACT_APP_AWS_IDENTITY_POOL_ID
    })
});
const columns = [{
    dataField: 'date',
    text: "Date",
    formatter: function (cell, row) {
        let date = moment(cell);
        return date.format('DD-MM-YYYY HH:mm:ss');
    },
    style: {
        whiteSpace: 'nowrap',
    },
}, {
    dataField: 'amount',
    text: "Amount",
}, {
    dataField: 'balance',
    text: "Balance",
}, {
    dataField: 'remarks',
    text: "Remarks",
}];

const FORMAT = 'YYYY-MM-DD';
const DATE_RANGE = [moment().subtract(1, 'day').format(FORMAT), moment().format(FORMAT)];
const DATE_FIELD = ['date_from', 'date_to'];
const INITIAL_STATE = {
    date: DATE_RANGE[0] + ' - ' + DATE_RANGE[1],
    dateDisplay: moment().subtract(1, 'day').format(FORMAT) + ' - ' + moment().format(FORMAT),
    amount: '',
    remarks: '',
    page: 1,
    limit: 10,
    type: '["DEPOSIT"]',
    date_from: DATE_RANGE[0],
    date_to: DATE_RANGE[1],
}
const INITIAL_PAGE = {
    page: 1,
    sizePerPage: 10,
    totalSize: 0,
    hideSizePerPage: true,
}
const INITIAL_QUERY = {
    date: DATE_RANGE[0] + ' - ' + DATE_RANGE[1],
    type: '["DEPOSIT"]',
    date_from: DATE_RANGE[0],
    date_to: DATE_RANGE[1],
}
const INITIAL_TYPE = ["DEPOSIT"];

const BalanceStatements = () => {
    const [messageObject, setMessage] = useState({ type: "", message: "" });
    const [statements, setStatements] = useState([]);
    const [filters, setFilters] = useState(INITIAL_STATE);
    const [pagingInfo, setPagingInfo] = useState(INITIAL_PAGE);
    const [query, setQuery] = useState(INITIAL_QUERY);
    const [types, setType] = useState(INITIAL_TYPE);
    const [isSearching, setSearch] = useState(false);

    useEffect(() => {
        DATE_FIELD.forEach(function (item, index) {
            document.getElementById(item).addEventListener('click', function () {
                // closeDatePicker(index);
            });
        });

        const fetchData = async () => {
            await Auth.currentSession()
                .then(data => {
                    // console.log(data.getIdToken().getJwtToken());
                    API.defaults.headers.common['Authorization'] = data.getIdToken().getJwtToken();
                    let query_parm = rh_custom_query(query);
                    let query2 = query_parm[0];
                    let status_query = query_parm[1];

                    API.get('balance-statement?' + status_query, {
                        // params: query,
                        params: query2,
                    })
                        .then(res => {
                            let data = res.data;
                            if (data.data) {
                                setStatements(data.data);
                            }

                            if (data.meta) {
                                setPagingInfo(pagingInfo => ({
                                    ...pagingInfo,
                                    page: res.data.meta.current_page,
                                    sizePerPage: res.data.meta.per_page,
                                    totalSize: res.data.meta.total,
                                }));
                            }
                            setSearch(false);
                        })
                        .catch(error => {
                            console.log(error);
                            ErrorToast(error.message);
                        });
                })
                .catch(error => {
                    console.log(error);
                    ErrorToast(error.message);
                })
                .then(() => {
                    setTimeout(() => {
                        setSearch(false);
                    }, 50000);
                });
        }

        fetchData();
    }, [query]
    );

    function handleChange(event) {
        const { name, type, value } = event.target;
        if (type !== 'checkbox') {
            setFilters(filters => ({ ...filters, [name]: value }));
        }
    }

    function handleCheckbox(event) {
        const { id, checked, value } = event.target;

        if (id === 'check-all') {
            if (checked) {
                setType(types => [...types, "DEPOSIT", "TRANSACTION", "REFUND", "COMMISSION"]);
            } else {
                setType([]);
            }
        } else {
            if (checked) {
                setType(types => [...types, value]);
            } else {
                let newTypes = types.filter(function (v, i, arr) {
                    return value !== v;
                });
                setType(newTypes);
            }
        }
    }

    function handleFormSubmit(event) {
        event.preventDefault();

        setQuery(query => ({
            ...query,
            ...filters,
            type: JSON.stringify(types),
        }));

        setSearch(true);
    }


    function resetFilters(event) {
        event.preventDefault();

        setFilters(INITIAL_STATE);

        setQuery(INITIAL_QUERY);

        setType(INITIAL_TYPE);

        setPagingInfo(INITIAL_PAGE);

        setSearch(false);
    }

    function generate(type) {
        Auth.currentSession().then(data => {
            const { payload } = data.getIdToken();

            const token = localStorage.getItem('notification-token');

            API.defaults.headers.common['Authorization'] = data.getIdToken().getJwtToken();

            delete query.limit;

            query.notification_token = token;
            query.export = type;
            API.get('balance-statement/export', {
                params: query,
            })
                .then((response) => {
                    console.log(response);
                    SuccessToast(response.message);
                })
                .catch((error) => {
                    console.log(error);
                    ErrorToast(error.message);
                });
        });
    }

    const handleTableChange = (type, { page, sizePerPage }) => {
        setQuery(query => ({
            ...query,
            ...filters,
            page: page,
            type: JSON.stringify(types),
        }));

        setPagingInfo(pagingInfo => ({
            ...pagingInfo,
            page: page,
            sizePerPage: sizePerPage,
        }));
    }

    /*custom*/
    function rh_custom_query(query) {
        delete query.dateDisplay;

        let status = query.type;
        if (!status) {
            status = '[DEPOSIT]';
        }
        let status_query = '';
        if (status) {
            status = status.substring(1);
            status = status.slice(0, -1);
            status = status.replace(/['"]+/g, '');
            status = status.split(',');

            let set = new Set(status);
            status = [...set];

            for (let i = 0; i < status.length; i++) {
                let amp = (i != 0) ? '&' : '';
                status_query += amp + 'type=' + status[i];
            }
            delete query.type;
        }

        query.date = (query.date_from && query.date_to) ? query.date_from + ' - ' + query.date_to : DATE_RANGE[0] + ' - ' + DATE_RANGE[1];
        delete query.date_from;
        delete query.date_to;
        return [query, status_query];
    }

    function closeDatePicker(seq, date = '', field = '') {
        let rdt = document.getElementsByClassName("rdt")[seq];
        if (rdt) {
            let rdt_class = rdt.classList;
            if (rdt_class.contains('rdtOpen')) {
                rdt_class.remove('rdtOpen');
            } else {
                rdt_class.add('rdtOpen');
            }
        }
        
        let isValidDate = ValidateDate(date);
        if (date && field && isValidDate) {
            setMessage({ type: "", message: "" });
            setFilters(filters => ({ ...filters, [field]: date.format('YYYY-MM-DD') }));
        }
        else if (!isValidDate) {
            setMessage({ type: "danger", message: "Error: please enter valid date" });
        }
    }
    
    /*end custom*/
    const { type, message } = messageObject;
    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <Breadcrumbs title="Reports" breadcrumbItem="Balance Statements" />
                    <Row>
                        <Col lg="3">
                            <Card className="filtersidebar">
                                <CardBody >
                                    <CardTitle className="mb-2">
                                        Filter
                                        </CardTitle>
                                    <form onSubmit={handleFormSubmit}>
                                        <div className="mt-2 pt-2">
                                            <button className="btn btn-primary" type="submit"
                                                disabled={isSearching ? true : false}>
                                                <i className="ft-filter"></i>
                                                {isSearching ? 'Searching...' : 'Search'}
                                            </button>
                                            <a href="/" className="btn btn-default" onClick={resetFilters}>Reset</a>
                                        </div>
                                        {message != "" &&
                                            <Alert className="mt-2" color={type}>{message}</Alert>
                                        }
                                        <div className="mt-2 pt-2">
                                            <h5 className="font-size-14 mb-2">Start Date <span className="text-muted mb-0 dateformatfont">YYYY-MM-DD</span></h5>
                                            <DateTime
                                                defaultValue={DATE_RANGE[0]}
                                                timeFormat={false}
                                                onChange={function (date) {
                                                    closeDatePicker(0, date, DATE_FIELD[0]);
                                                }}
                                                inputProps={{
                                                    'id': DATE_FIELD[0],
                                                    'name': DATE_FIELD[0],
                                                    'readOnly': 'readOnly'
                                                }}
                                                dateFormat={'YYYY-MM-DD'}
                                            />
                                        </div>
                                        <div className="mt-2 pt-2">
                                            <h5 className="font-size-14 mb-2">End Date <span className="text-muted mb-0 dateformatfont">YYYY-MM-DD</span></h5>
                                            <DateTime
                                                defaultValue={DATE_RANGE[1]}
                                                timeFormat={false}
                                                onChange={function (date) {
                                                    closeDatePicker(1, date, DATE_FIELD[1]);
                                                }}
                                                inputProps={{
                                                    'id': DATE_FIELD[1],
                                                    'name': DATE_FIELD[1]
                                                }}
                                                dateFormat={'YYYY-MM-DD'}
                                            />
                                        </div>
                                        <div className="mt-2 pt-2">
                                            <h5 className="font-size-14 mb-2">Amount</h5>
                                            <input
                                                type="number"
                                                className="form-control mb-2 mr-sm-2 mb-sm-0x"
                                                id="amount"
                                                name="amount"
                                                placeholder="Amount"
                                                value={filters.amount}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="mt-2 pt-2">
                                            <h5 className="font-size-14 mb-2">Remarks</h5>
                                            <input
                                                className="form-control mb-2 mr-sm-2 mb-sm-0x"
                                                id="remarks"
                                                name="remarks"
                                                placeholder="Remarks"
                                                value={filters.remarks}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="mt-2 pt-2">
                                            <h5 className="font-size-14 mb-2">Types</h5>

                                            <div className="custom-control custom-checkbox mt-2">
                                                <input type="checkbox" id="check-all" className="custom-control-input" onChange={handleCheckbox}
                                                    checked={types.indexOf('DEPOSIT') !== -1 && types.indexOf('TRANSACTION') !== -1 && types.indexOf('REFUND') !== -1 && types.indexOf('COMMISSION') !== -1 ? true : false} />
                                                <label className="custom-control-label" htmlFor="check-all">All</label>
                                            </div>

                                            <div className="custom-control custom-checkbox mt-2">
                                                <input type="checkbox" id="Deposit" value="DEPOSIT" className="custom-control-input" onChange={handleCheckbox}
                                                    checked={types.indexOf('DEPOSIT') !== -1 ? true : false} />
                                                <label className="custom-control-label" htmlFor="Deposit">Deposit</label>
                                            </div>

                                            <div className="custom-control custom-checkbox mt-2">
                                                <input type="checkbox" id="Transaction" value="TRANSACTION" className="custom-control-input" onChange={handleCheckbox}
                                                    checked={types.indexOf('TRANSACTION') !== -1 ? true : false} />
                                                <label className="custom-control-label" htmlFor="Transaction">Transaction</label>
                                            </div>

                                            <div className="custom-control custom-checkbox mt-2">
                                                <input type="checkbox" id="Refund" value="REFUND" className="custom-control-input" onChange={handleCheckbox}
                                                    checked={types.indexOf('REFUND') !== -1 ? true : false} />
                                                <label className="custom-control-label" htmlFor="Refund">Refund</label>
                                            </div>

                                            <div className="custom-control custom-checkbox mt-2">
                                                <input type="checkbox" id="Commision" value="COMMISSION" className="custom-control-input" onChange={handleCheckbox}
                                                    checked={types.indexOf('COMMISSION') !== -1 ? true : false} />
                                                <label className="custom-control-label" htmlFor="Commision">Commision</label>
                                            </div>
                                        </div>
                                    </form>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col lg="9">
                            <Card className="tableCard">
                                <CardBody>
                                    <CardTitle>Balance Statement</CardTitle>
                                    <div className="table-responsive">
                                        <div className="align-right">
                                            <OverlayTrigger
                                                placement="left"
                                                overlay={
                                                    <Tooltip>
                                                        PDF
                                            </Tooltip>
                                                }
                                            >
                                                <a href="/" role="button" className="mr-2 pdfClass" onClick={(e) => {
                                                    e.preventDefault();

                                                    generate('PDF');
                                                }}>
                                                    <i className="far fa-file-pdf"></i>
                                                </a>
                                            </OverlayTrigger>

                                            <OverlayTrigger
                                                placement="right"
                                                overlay={
                                                    <Tooltip>
                                                        Excel
                                            </Tooltip>
                                                }
                                            >
                                                <a href="/" role="button" className="mr-2 excelClass" onClick={(e) => {
                                                    e.preventDefault();
                                                    generate('XLSX');
                                                }}>
                                                    <i className="far fa-file-excel"></i>
                                                </a>
                                            </OverlayTrigger>
                                        </div>
                                        <PaginationProvider
                                            pagination={paginationFactory(pagingInfo)}
                                        >
                                            {
                                                ({
                                                    paginationProps,
                                                    paginationTableProps
                                                }) => (
                                                        <div>
                                                            <PaginationTotalStandalone
                                                                {...paginationProps}
                                                            />
                                                            <BootstrapTable
                                                                remote={true}
                                                                keyField="id"
                                                                hover
                                                                responsive
                                                                striped
                                                                columns={columns}
                                                                data={statements}
                                                                headerClasses="thead-light thead-lg"
                                                                onTableChange={handleTableChange}
                                                                {...paginationTableProps}
                                                            />
                                                        </div>
                                                    )
                                            }
                                        </PaginationProvider>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    )
}

export default BalanceStatements;