export async function onRequestGet({ env }) {
  const result = await env.DB
    .prepare(`
      SELECT id, title, content, category, tags, created_at, updated_at
      FROM knowledge
      ORDER BY updated_at DESC
    `)
    .all();

  return Response.json({
    success: true,
    data: result.results
  });
}