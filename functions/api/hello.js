export function onRequestGet() {
  return Response.json({
    success: true,
    message: '后端 API 工作正常！',
    time: new Date().toISOString()
  })
}