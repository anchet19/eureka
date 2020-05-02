import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography } from '@material-ui/core';

export default class BusinessCard extends Component {
    render() {
        return (
            <div className="BusinessCard" key={this.props.business.business_id}>
                <Link to={`/details/` + this.props.business.business_id} style={{textDecoration: "none"}}>
                    <Card style={{ margin: 5}}>
                        <CardContent style={{ padding: 10 }}>
                            <span>
                                <Typography variant="h6"    color="textPrimary"   component="h3"   style={{display: "inline", fontSize: "1rem"}}>
                                    {this.props.business.name}
                                </Typography>
                                <Typography variant="body1" color="textSecondary" component="span"    style={{float: "right"}}>
                                    {this.props.index}
                                </Typography>
                            </span>
                            <Typography variant="body1" color="textSecondary" component="p"    style={{fontSize: ".75rem"}}>
                                {this.props.business.address}
                            </Typography>
                            <Typography variant="body1" color="textSecondary" component="p"    style={{fontSize: ".75rem"}}>
                                {this.props.business.cuisine}
                            </Typography>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        )
    }
}