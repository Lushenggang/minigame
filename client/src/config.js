const server = {
  dev: {
    url: 'http://localhost:3000',
    ws: 'ws://localhost:3000/socket'
  }
}

export const BASE_URL = server.dev.url
export const WS_URL = server.dev.ws