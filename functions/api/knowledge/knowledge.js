function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

// GET /api/knowledge
// 获取全部知识
export async function onRequestGet({ env, request }) {
  if (!env.DB) {
    return json({
      success: false,
      error: "D1 binding DB 不存在"
    }, 500);
  }

  const url = new URL(request.url);
  const keyword = url.searchParams.get("keyword") || "";
  const category = url.searchParams.get("category") || "";

  let result;

  if (keyword || category) {
    result = await env.DB.prepare(`
      SELECT id, title, content, category, tags, created_at, updated_at
      FROM knowledge
      WHERE
        (? = '' OR title LIKE '%' || ? || '%' OR content LIKE '%' || ? || '%' OR tags LIKE '%' || ? || '%')
        AND (? = '' OR category = ?)
      ORDER BY updated_at DESC
    `)
      .bind(keyword, keyword, keyword, keyword, category, category)
      .all();
  } else {
    result = await env.DB.prepare(`
      SELECT id, title, content, category, tags, created_at, updated_at
      FROM knowledge
      ORDER BY updated_at DESC
    `).all();
  }

  return json({
    success: true,
    data: result.results
  });
}

// POST /api/knowledge
// 新增知识
export async function onRequestPost({ env, request }) {
  if (!env.DB) {
    return json({
      success: false,
      error: "D1 binding DB 不存在"
    }, 500);
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json({
      success: false,
      error: "请求体必须是 JSON"
    }, 400);
  }

  const title = String(body.title || "").trim();
  const content = String(body.content || "").trim();
  const category = String(body.category || "").trim();
  const tags = String(body.tags || "").trim();

  if (!title || !content) {
    return json({
      success: false,
      error: "title 和 content 不能为空"
    }, 400);
  }

  const result = await env.DB.prepare(`
    INSERT INTO knowledge
      (title, content, category, tags, created_at, updated_at)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `)
    .bind(title, content, category, tags)
    .run();

  return json({
    success: true,
    id: result.meta.last_row_id
  }, 201);
}