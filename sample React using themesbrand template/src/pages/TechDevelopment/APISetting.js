import React, { Component } from "react";
import Iframe from 'react-iframe'
import { Container, Row, Col, Card, CardBody, CardTitle, Alert } from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';

class APISetting extends Component {
    constructor() {
        super();
    }
    componentDidMount() {
        var iframe = document.getElementById("documentation");
        debugger;
        // var elmnt = iframe.contentWindow.document.getElementsByTagName("html")[0];
        // elmnt.style.overflow = "hidden";
    }
    render() {
        return (
            <React.Fragment>
                <div className="page-content">
                    <Container fluid>
                        <Breadcrumbs title="" breadcrumbItem="apisettings" />
                        <Row>
                            <Col>
                                <Card className="tableCard">
                                    <CardBody>
                                        <CardTitle>API Documentation</CardTitle>
                                        <Iframe
                                            src="https://developer.iimmpact.com/docs/"
                                            // url="https://developer.iimmpact.com/docs/"
                                            // width="450px"
                                            height="650px "
                                            id="documentation"
                                            className="documentationframe"
                                            // display="initial"
                                            // position="relative"
                                            allowfullscreen=""
                                            frameborder="0"
                                        />
                                    </CardBody>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </React.Fragment>
        )
    }
}
export default APISetting;