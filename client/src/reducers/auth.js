/**
 * Reducer for updating global Auth state.
 * Defines a list of actions, each updates state by passing it a new object
 * which will trigger a rerender of any components using the AuthContext
 * @author Chris Ancheta
 */

import jwt from 'jsonwebtoken';
import { getInitialState } from '../authProvider'

function authReducer(state, action) {
  switch (action.type) {
    // Update auth state and send token to localStorage
    case 'login':
      const { token } = action.payload
      const decoded = jwt.decode(token);
      localStorage.setItem("eurekajwt", token)
      return { user: { uid: decoded.uid, businesses: decoded.businesses }, isAuthenticated: true, error: '' }
    // Clear token from localStorage and set default state
    case 'logout':
      localStorage.removeItem("eurekajwt")
      return {
        user: {},
        isAuthenticated: false
      }
    case 'error':
      const { error } = action.payload
      return {
        user: {},
        isAuthenticated: false,
        error
      }
    default:
      return state
  }
}

export default authReducer