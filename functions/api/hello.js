export function onRequest() {
  return Response.json({
    message: '你好，Cloudflare Functions！'
  })
}