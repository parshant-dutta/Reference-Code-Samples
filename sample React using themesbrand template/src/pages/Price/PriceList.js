import React, { useEffect, useState } from 'react';
import { Row, Col, Card, CardBody, CardTitle, Alert } from "reactstrap";
import AWS from 'aws-sdk';
import { Auth } from 'aws-amplify';
import BootstrapTable from "react-bootstrap-table-next";
import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.css";
//Import Breadcrumb
import Breadcrumbs from '../../components/Common/Breadcrumb';

import API from '../../Utils/api';

AWS.config.update({
    region: process.env.REACT_APP_AWS_REGION,
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: process.env.REACT_APP_AWS_IDENTITY_POOL_ID
    })
});

const columns = [
    {
        dataField: 'product_img',
        text: "Image",
        formatter: function (cell, row) {
            if (cell) {
                cell = 'https://cloudimage.iimmpact.com/v7/' + cell + '?&width=50&height=50&sharpen=1';
            }
            return (<span><img src={cell} /></span>)
        },
    }, {
        dataField: 'status',
        text: "Status",
    }, {
        dataField: 'category',
        text: "Category",
    }, {
        dataField: 'product_code',
        text: "Product Code",
    }, {
        dataField: 'product_name',
        text: "Product Name",
    }, {
        dataField: 'denomination',
        text: "Denomination",
    }, {
        dataField: 'unit_price',
        text: "Unit Price",
    }, {
        dataField: 'discount',
        text: "Discount",
    }, {
        dataField: 'note',
        text: "Note",
    }];

const INITIAL_FILTER = {
    category: ''
}

const INITIAL_QUERY = {
}
const PriceList = () => {
    const [filters, setFilters] = useState(INITIAL_FILTER);
    const [statements, setStatements] = useState([]);
    const [category, setCategories] = useState([]);
    const [query, setQuery] = useState(INITIAL_QUERY);
    const [isSearching, setSearch] = useState(false);
    // const [pagingInfo] = useState(INITIAL_PAGE);

    useEffect(() => {
        const fetchData = async () => {
            await Auth.currentSession()
                .then(data => {
                    API.defaults.headers.common['Authorization'] = data.getIdToken().getJwtToken();

                    API.get('products', {
                        params: query,
                    })
                        .then(res => {
                            let data = res.data;
                            if (data.data) {
                                setStatements(data.data);
                            }
                            setSearch(false);
                        })
                        .catch(error => {
                            console.log(error);
                            // addToast(error.message, {appearance: 'error', autoDismiss: true});
                        });

                    API.get('products')
                        .then(res => {
                            let data = res.data;
                            if (data.data) {
                                const uniqueTags = [];
                                data.data.map(res => {
                                    if (uniqueTags.indexOf(res.category) === -1) {
                                        uniqueTags.push(res.category)
                                    }
                                });
                                setCategories(uniqueTags);
                            }
                        })
                        .catch(error => {
                            console.log(error);
                            // addToast(error.message, {appearance: 'error', autoDismiss: true});
                        });
                })
                .catch(error => {
                    console.log(error);
                    // addToast(error.message, {appearance: 'error', autoDismiss: true});
                })
        }
        fetchData();
    }, [query]);

    function handleFormSubmit(event) {
        event.preventDefault();
        setSearch(true);

        setQuery(query => ({
            ...query,
            ...filters
        }));
    }

    function reset(event) {
        event.preventDefault();

        setFilters(INITIAL_FILTER);

        setQuery(INITIAL_QUERY);

        setSearch(false);
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setFilters(filters => ({ ...filters, [name]: value }));
    }

    return (
        <React.Fragment>
            <div className="page-content">
                <div className="container-fluid">
                    <Breadcrumbs title="Price List" breadcrumbItem="" />
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
                                        {/* {message != "" &&
                      <Alert className="mt-2" color={type}>{message}</Alert>
                    } */}
                                        <div className="mt-2 pt-2">
                                            <h5 className="font-size-14 mb-2">Category</h5>
                                            <select className="form-control select2" id="category"
                                                name="category" key="category" value={filters.category} onChange={handleChange} title="Category">
                                                <option value="">Select Category</option>
                                                {category.map((item, key) =>
                                                    <option key={key} value={item}>{item}</option>
                                                )}
                                            </select>
                                        </div>
                                    </form>
                                </CardBody>
                            </Card>
                        </Col>
                        <Col lg="9">
                            <Card>
                                <CardBody className="tableCard">
                                    <CardTitle>Price List</CardTitle>
                                    <div className="table-responsive">
                                        <BootstrapTable
                                            key="pricelist"
                                            keyField="product_img"
                                            hover
                                            striped
                                            columns={columns}
                                            data={statements}
                                        // pagination={
                                        //     paginationFactory(pagingInfo)
                                        // }
                                        />
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </React.Fragment>
    )
}

export default PriceList;