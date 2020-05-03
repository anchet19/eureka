import React, { Fragment } from 'react';

import { Link as RouterLink, useHistory } from 'react-router-dom';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import HomeIcon from '@material-ui/icons/Home'
//import FormGroup from '@material-ui/core/FormGroup';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

import { useAuth } from '../../hooks/useAuth'
import { Divider, ListSubheader } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  logout: {
    marginTop: '20px'
  }
}));

const Header = () => {
  const history = useHistory()
  const { user, logout, isAuthenticated } = useAuth()
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleAccountMenu = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleHome = event => {
    history.push('/')
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose()
    logout()
  }

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar className={classes.toolbar}>
          <div>
            <IconButton
              edge="start"
              aria-label="home button"
              onClick={handleHome}
            >
              <HomeIcon style={{ color: 'white' }} />
            </IconButton>
          </div>

          <div>
            <IconButton
              className={classes.menuButton}
              edge="end"
              aria-label="account of current user"
              aria-controls="account-menu-appbar"
              aria-haspopup="true"
              onClick={handleAccountMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>

            <Menu
              id="account-menu-appbar"
              anchorEl={anchorEl}

              keepMounted
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              open={open}
              onClose={handleClose}
              variant='menu'
            >
              {isAuthenticated() ?
                // User is currently logged in
                <div>
                  {user.businesses.length > 0 ?
                    <Fragment>
                      <ListSubheader>My Businesses</ListSubheader>
                      <Divider />
                      {user.businesses.map(el => (
                        <MenuItem
                          key={el.bid}
                          component={RouterLink}
                          to={`/accounts/businesses/${el.bid}`}
                          onClick={handleClose}
                        >
                          {el.name}
                        </MenuItem>
                      ))
                      }
                    </Fragment>
                    :
                    <MenuItem component={RouterLink} to={`/accounts/businesses`} onClick={handleClose}>Link a Business!</MenuItem>

                  }
                  <MenuItem className={classes.logout} onClick={handleLogout}>Logout</MenuItem>

                </div>
                :
                // User is currently logged out
                <div>
                  <MenuItem component={RouterLink} to='/login' onClick={handleClose}>Login</MenuItem>
                  <MenuItem component={RouterLink} to='/accounts/users' onClick={handleClose}>Register</MenuItem>
                </div>
              }
            </Menu>
          </div>
        </Toolbar>

      </AppBar>
    </div>
  );
};

export default Header;
