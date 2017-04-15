import { createServer, connect, Socket } from "net"
import { stat, chmod, unlinkSync } from "fs"
import { spawn } from "child_process"

const tsserver = spawn("tsserver")
function Server(socket: Socket) {
  let ended = false
  socket.on("data", function(data) {
    console.log("request to tsserver length: ", data.length)
    tsserver.stdin.write(data)
  })
  tsserver.stdout.on("data", data => {
    console.log("tsserver response length: ", data.length)
    if (ended) return
    socket.write(data)
  })
  socket.on("end", () => {
    console.log("Socket ended")
  })
  socket.on("close", () => {
    console.log("Client closed socket")
    ended = true
  })
}

const socketPath = "/tmp/tsserver.sock"

const server = createServer(Server)
tsserver.on("error", (error: any) => {
  if (error) {
    console.log(error)
  }
})
server.on("error", (error: any) => {
  if (isAddrInUser(error)) {
    connect(socketPath, function() {
      throw error
    }).on("error", function(error) {
      if (!isConnRefused(error)) {
        throw error
      }
      unlinkSync(socketPath)
      server.listen(socketPath)
    })
  }
  else {
    throw error
  }
})

server.on("listening", function() {
  chmod(socketPath, 0o777, function(){})
})

server.listen(socketPath)

function isAddrInUser(error: any) {
  return error.code === "EADDRINUSE"
}

function isConnRefused(error: any) {
  return error.code === "ECONNREFUSED"
}
