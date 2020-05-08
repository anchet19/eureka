/**
 * Global context provider for accessing user data.
 * @author Chris Ancheta
 */
import React, { useReducer } from "react"
import authReducer from './reducers/auth'
import jwt from "jsonwebtoken"

/**
 * Check for an existing token and load state from that if it exists
 * otherwise use DEFAULT_STATE
 * @todo Set an expiration timer / refesh on the token
 */
export const getInitialState = () => {
  const DEFAULT_STATE = {
    user: {},
    isAuthenticated: false
  }

  let stored_state = {}

  // Check if a token exists in localStorage and attempt to load the data
  if (typeof localStorage !== "undefined") {
    const token = localStorage.getItem("eurekajwt");
    const decoded = token ? jwt.decode(token) : "{}"
    stored_state = {
      user: decoded,
      isAuthenticated: !!token
    }
  }

  return {
    ...DEFAULT_STATE,
    ...stored_state
  }
}

// Create the context
export const AuthContext = React.createContext({
  state: getInitialState(),
  dispatch: () => { }
})

// Export the wrapper component
export const AuthProvider = ({ children }) => {

  const [state, dispatch] = useReducer(authReducer, getInitialState())
  return (
    <AuthContext.Provider value={[state, dispatch]}>
      {children}
    </AuthContext.Provider>
  )
}