
export function setToken (loginToken) {
  localStorage.setItem('loginToken', loginToken)
}

export function getToken () {
  return localStorage.getItem('loginToken')
}

export function clearToken () {
  return localStorage.removeItem('loginToken')
}
