
const conn = Deno.listen({
    port: 8400
});
const httpConn = Deno.serveHttp(await conn.accept());
const e = await httpConn.nextRequest();
let counter = 0;
if (e) {
  const { socket, response } = Deno.upgradeWebSocket(e.request);
  socket.onopen = () => {
    socket.send("Hello World!");
  };
  socket.onmessage = (e) => {
    console.log(e.data);
    counter ++;
    if (counter == 5) {
        
        socket.close();
    }
  };
  socket.onclose = () => console.log("WebSocket has been closed.");
  socket.onerror = (e) => console.error("WebSocket error:", e);
  e.respondWith(response);
}