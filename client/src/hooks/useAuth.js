/**
 * Hook for handling authorization business logic.
 * 
 */

import { useContext } from "react"
import { useHistory } from 'react-router-dom'
import axios from "axios"
import { AuthContext } from '../authProvider'

export const useAuth = () => {
  const history = useHistory();

  const [state, dispatch] = useContext(
    AuthContext
  )

  /**
   * Make an authorization request to the server to verify users credentials.
   * On success - Perform login action and navigate to homepage
   * On error - return the error
   * @param {string} username The users email
   * @param {string} password The users password
   */
  const login = (username, password) => {
    axios.post('/login', { username, password })
      .then(res => {
        const { error, token } = res.data
        if (token) {
          dispatch({
            type: 'login',
            payload: { token: token }
          })
          history.replace('/')
        } else {
          console.log(error);
          dispatch({
            type: "error",
            payload: { error: error }
          })
          return false
        }
      })
      .catch(err => {
        console.error(err.stack)
        return false
      })
  }

  // Dispatch the logout action
  const logout = () => {
    dispatch({
      type: 'logout'
    })
    history.replace('/')
  }

  // Return users authentication state. Useful for redirects
  const isAuthenticated = () => {
    return state.isAuthenticated
  }

  const getErrors = () => {
    return state.error
  }

  return {
    user: state.user,
    login,
    logout,
    isAuthenticated,
    getErrors
  }
}