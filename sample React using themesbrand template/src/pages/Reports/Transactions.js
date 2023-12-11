import React, { useEffect, useState } from 'react';
import AWS from 'aws-sdk';
import { Auth } from 'aws-amplify';
import { Container, Row, Col, Card, CardBody, CardTitle, Alert } from "reactstrap";
import { Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import BootstrapTable from "react-bootstrap-table-next";
// import cellEditFactory from "react-bootstrap-table2-editor";
// import paginationFactory from 'react-bootstrap-table2-paginator';
import paginationFactory, {
  PaginationProvider,
  PaginationTotalStandalone
} from 'react-bootstrap-table2-paginator';
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.css";
import moment from 'moment';
import DateTime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import API from '../../Utils/api';
import { ValidateDate } from '../Utility/ValidateDate';
//Import Breadcrumb
import Breadcrumbs from '../../components/Common/Breadcrumb';
import "../Tables/datatables.scss";

import { SuccessToast, ErrorToast } from '../../Utils/toaster';

AWS.config.update({
  region: process.env.REACT_APP_AWS_REGION,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: process.env.REACT_APP_AWS_IDENTITY_POOL_ID
  })
});

const statusColor = (status) => {
  let color = '';
  let colorCode = '';

  switch (parseInt(status)) {
    case 0:
    case 1:
    case 2:
    case 3:
      color = 'warning';
      colorCode = '#50a5f1';
      break;

    case 20:
      color = 'success';
      colorCode = '#FFFFFF';
      break;

    case 40:
    case 45:
    case 47:
    case 50:
    case 52:
    case 53:
    case 55:
      color = 'danger';
      colorCode = '#f46a6a';
      break;

    default:
      color = 'light';
      colorCode = '';
      break;
  }

  return { color, colorCode };

}

const columns = [{
  dataField: 'trxid',
  text: "TrxID",
  sort: true,
}, {
  dataField: 'date',
  text: "Date",
  sort: true,
  formatter: function (cell, row) {
    let date = moment(cell);
    return date.format('DD-MM-YY HH:mm:ss');
  },
}, {
  dataField: 'product.product_name',
  text: "Product",
  sort: true,
}, {
  dataField: 'account',
  text: "Account",
  sort: true,
}, {
  dataField: 'amount',
  text: "Amount",
  sort: true,
}, {
  dataField: 'price',
  text: "Price",
  sort: true,
}, {
  dataField: 'status.status',
  text: "Status",
  formatter: function (cell, row) {
    let { color } = statusColor(row.status.status_code);
    return (
      <Badge variant={color}>{cell}</Badge>
    )
  },
}, {
  dataField: 'status.date',
  text: "Status Date",
  sort: true,
  formatter: function (cell, row) {
    let date = moment(cell);
    return date.format('DD-MM-YY HH:mm:ss');
  },
}, {
  dataField: 'sn',
  text: "SN",
  sort: true,
},
{
  dataField: 'pin',
  text: "PIN",
  sort: true,
}, {
  dataField: 'remarks',
  text: "Remarks",
  sort: true,
}, {
  dataField: 'refid',
  text: "Ref ID",
  sort: true,
}];

const FORMAT = 'YYYY-MM-DD';
const DATE_RANGE = [moment().subtract(1, 'day').format(FORMAT), moment().format(FORMAT)];
const DATE_FIELD = ['date_from', 'date_to'];

const INITIAL_FILTER = {
  date: DATE_RANGE[0] + ' - ' + DATE_RANGE[1],
  product: '',
  account: '',
  sn: '',
  status: '[PENDING]',
  page: 1,
  limit: 10,
  date_from: DATE_RANGE[0],
  date_to: DATE_RANGE[1],
}
const INITIAL_STATUS = ['PENDING'];

const INITIAL_PAGE = {
  page: 1,
  sizePerPage: 10,
  totalSize: 0,
  hideSizePerPage: true,
}

const INITIAL_QUERY = {
  date: DATE_RANGE[0] + ' - ' + DATE_RANGE[1],
  status: '[PENDING]',
  date_from: DATE_RANGE[0],
  date_to: DATE_RANGE[1],
}
const Transactions = () => {
  const [statements, setStatements] = useState([]);
  const [messageObject, setMessage] = useState({ type: "", message: "" });
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState(INITIAL_FILTER);
  const [pagingInfo, setPagingInfo] = useState(INITIAL_PAGE);
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [isSearching, setSearch] = useState(false);
  const [status, setStatus] = useState(INITIAL_STATUS);

  // const {addToast} = useToasts();

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

          /*rh_custom_query param*/
          let query_parm = rh_custom_query(query);
          let query2 = query_parm[0];
          let status_query = query_parm[1];

          API.get('transactions?' + status_query, {
            // params: query,
            params: query2,
          })
            .then(res => {
              if (res.data.data) {
                setTransactions(res.data.data);
              }

              setPagingInfo(pagingInfo => ({
                ...pagingInfo,
                page: res.data.meta.current_page,
                sizePerPage: res.data.meta.per_page,
                totalSize: res.data.meta.total,
              }));

              setSearch(false);
            })
            .catch(error => {
              console.log(error);
              ErrorToast(error.message);
              // addToast(error.message, {appearance: 'error', autoDismiss: true});
            });

          API.get('products')
            .then(res => {
              let data = res.data;
              if (data.data) {
                const uniqueTags = [];
                data.data.map(res => {
                  if (uniqueTags.indexOf(res.product_code) === -1) {
                    uniqueTags.push(res)
                  }
                });
                setStatements(uniqueTags);
              }
            })
            .catch(error => {
              console.log(error);
              // addToast(error.message, {appearance: 'error', autoDismiss: true});
            });
        })
        .catch(error => {
          console.log(error);
          ErrorToast(error.message);

          // addToast(error.message, {appearance: 'error', autoDismiss: true});
        })
        .then(() => {
          setTimeout(() => {
            setSearch(false);
          }, 50000);
        });
    }

    fetchData();
  }, [query]);

  function handleChange(event) {
    const { name, type, value } = event.target;

    if (type !== 'checkbox') {
      setFilters(filters => ({ ...filters, [name]: value }));
    } else {
      // if (status.indexOf(value) == -1) {
      //   setStatus(status => [...status, value]);
      // } else {
      //   setStatus(status => status.splice(status.indexOf(value), 1));
      // }
    }
  }

  function handleCheckbox(event) {
    const { id, checked, value } = event.target;

    if (id === 'check-all') {
      if (checked) {
        setStatus(status => [...status, 'PENDING', 'SUCCESSFUL', 'FAILED']);
      } else {
        setStatus([]);
      }
    } else {
      if (checked) {
        setStatus(status => [...status, value]);
      } else {
        let newStatus = status.filter(function (v, i, arr) {
          return value !== v;
        });
        setStatus(newStatus);
      }
    }
  }

  function handleFormSubmit(event) {
    event.preventDefault();

    setSearch(true);

    setQuery(query => ({
      ...query,
      ...filters,
      status: JSON.stringify(status),
    }));
  }

  function reset(event) {
    event.preventDefault();

    setFilters(INITIAL_FILTER);

    setQuery(INITIAL_QUERY);

    setStatus(INITIAL_STATUS);

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
      API.get('transactions/export', {
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
      status: JSON.stringify(status),
    }));

    setPagingInfo(pagingInfo => ({
      ...pagingInfo,
      page: page,
      sizePerPage: sizePerPage,
    }));
  }

  /*custom*/
  function rh_custom_query(query) {
    let status = query.status;
    if (!status) {
      status = '[PENDING]';
    }

    let status_query = '';
    if (status) {
      status = status.substring(1);
      status = status.slice(0, -1);
      status = status.replace(/['"]+/g, '');
      let status_arr = status.split(',');
      let set = new Set(status_arr);
      status_arr = [...set];

      for (let i = 0; i < status_arr.length; i++) {
        let amp = (i != 0) ? '&' : '';
        status_query += amp + 'status=' + status_arr[i].trim();
      }
    }

    query.date = (query.date_from && query.date_to) ? query.date_from + ' - ' + query.date_to : DATE_RANGE[0] + ' - ' + DATE_RANGE[1];
    delete query.date_from;
    delete query.date_to;

    delete query.status;
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
      setFilters(filters => ({ ...filters, [field]: moment(date).format('YYYY-MM-DD') }));
    }
    else if (!isValidDate) {
      setMessage({ type: "danger", message: "Error: please enter valid date" });
    }
  }

  const { type, message } = messageObject;
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Reports" breadcrumbItem="Transactions" />
          <Row>
            <Col lg="3">
              <Card>
                <CardBody className="filtersidebar">
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

                      <a className="btn btn-default" href="/" onClick={reset}>Reset</a>
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
                          'name': DATE_FIELD[0]
                          , 'autoComplete': "off"
                          // ,'readOnly': 'readOnly'
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
                          , 'autoComplete': "off"
                          // ,'readOnly': 'readOnly'
                        }}
                        dateFormat={'YYYY-MM-DD'}
                      />
                    </div>
                    <div className="mt-2 pt-2">
                      <h5 className="font-size-14 mb-2">Product</h5>
                      <select className="form-control select2" id="product-code"
                        name="product" key="product" value={filters.product} onChange={handleChange} title="Product">
                        <option value="">Select Product</option>
                        {statements.map((item, key) =>
                          <option key={key} value={item.product_code}>{item.product_name}</option>
                        )}
                      </select>
                    </div>
                    <div className="mt-2 pt-2">
                      <h5 className="font-size-14 mb-2">Account</h5>
                      <input
                        className="form-control mb-2 mr-sm-2 mb-sm-0x"
                        id="topup-number"
                        name="account"
                        placeholder="Account"
                        autoComplete="off"
                        value={filters.account}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mt-2 pt-2">
                      <h5 className="font-size-14 mb-2">Types</h5>

                      <div className="custom-control custom-checkbox mt-2">
                        <input type="checkbox" id="check-all" className="custom-control-input" onChange={handleCheckbox}
                          checked={status.indexOf('PENDING') !== -1 && status.indexOf('SUCCESSFUL') !== -1 && status.indexOf('FAILED') !== -1 ? true : false} />
                        <label className="custom-control-label" htmlFor="check-all">All</label>
                      </div>
                      <div className="custom-control custom-checkbox mt-2">
                        <input type="checkbox" id="Successful" className="custom-control-input" value="SUCCESSFUL" onChange={handleCheckbox}
                          checked={status.indexOf('SUCCESSFUL') !== -1 ? true : false} />
                        <label className="custom-control-label" htmlFor="Successful">Successful</label>
                      </div>

                      <div className="custom-control custom-checkbox mt-2">
                        <input type="checkbox" id="Failed" className="custom-control-input" value="FAILED" onChange={handleCheckbox}
                          checked={status.indexOf('FAILED') !== -1 ? true : false} />
                        <label className="custom-control-label" htmlFor="Failed">Failed</label>
                      </div>

                      <div className="custom-control custom-checkbox mt-2">
                        <input type="checkbox" id="Pending" className="custom-control-input" value="PENDING" onChange={handleCheckbox}
                          checked={status.indexOf('PENDING') !== -1 ? true : false} />
                        <label className="custom-control-label" htmlFor="Pending">Pending</label>
                      </div>
                    </div>
                  </form>
                </CardBody>
              </Card>
            </Col>
            <Col lg="9">
              <Card>
                <CardBody className="tableCard">
                  <CardTitle>Transactions</CardTitle>
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
                                data={transactions}
                                columns={columns}
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
  );
}

export default Transactions;
