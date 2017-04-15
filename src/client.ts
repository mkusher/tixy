import { createConnection } from "net"
const socketPath = "/tmp/tsserver.sock"

const socket = createConnection(socketPath)
process.stdin.on("data", function(data: Buffer) {
  socket.write(data)
})
socket.on("data", function(data) {
  process.stdout.write(data)
})

