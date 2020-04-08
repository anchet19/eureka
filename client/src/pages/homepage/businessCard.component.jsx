import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography, Fab } from '@material-ui/core';

export default class BusinessCard extends Component {
    render() {
        return (
            <Link to={`/details/1`} style={{textDecoration: "none"}}>
                <Card style={{ margin: 5 }}>
                    <CardContent style={{ padding: 10 }}>
                        <Typography variant="h6"    color="textPrimary"   component="h3" style={{fontSize: "1rem"}}>
                        {this.props.business.name}
                        </Typography>
                        <Typography variant="body1" color="textSecondary" component="p"  style={{fontSize: ".75rem"}}>
                        {this.props.business.address}
                        </Typography>
                        <Typography variant="body1" color="textSecondary" component="p"  style={{fontSize: ".75rem"}}>
                        {this.props.business.tags}
                        </Typography>
                        <Typography variant="body1" color="textSecondary" component="p"  style={{fontSize: ".75rem"}}>
                        {this.props.business.phone}
                        </Typography>
                    </CardContent>
                </Card>
            </Link>
        )
    }
}