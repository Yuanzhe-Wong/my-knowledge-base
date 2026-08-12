export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const keyword = url.searchParams.get("keyword")?.trim() || "";

  let result;

  if (keyword) {
    result = await env.DB.prepare(`
      SELECT *
      FROM knowledge
      WHERE title LIKE ?1
         OR content LIKE ?1
         OR category LIKE ?1
         OR tags LIKE ?1
      ORDER BY updated_at DESC
    `)
      .bind(`%${keyword}%`)
      .all();
  } else {
    result = await env.DB.prepare(`
      SELECT *
      FROM knowledge
      ORDER BY updated_at DESC
    `).all();
  }

  return Response.json({
    success: true,
    data: result.results
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();

    const title = String(body.title || "").trim();
    const content = String(body.content || "").trim();
    const category = String(body.category || "").trim();
    const tags = Array.isArray(body.tags) ? body.tags : [];

    if (!title || !content) {
      return Response.json(
        {
          success: false,
          error: "标题和内容不能为空"
        },
        { status: 400 }
      );
    }

    const result = await env.DB.prepare(`
      INSERT INTO knowledge (title, content, category, tags)
      VALUES (?1, ?2, ?3, ?4)
    `)
      .bind(
        title,
        content,
        category,
        JSON.stringify(tags)
      )
      .run();

    return Response.json(
      {
        success: true,
        id: result.meta.last_row_id
      },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}