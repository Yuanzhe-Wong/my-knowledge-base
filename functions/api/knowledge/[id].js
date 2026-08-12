function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

// GET /api/knowledge/1
// 获取一条知识
export async function onRequestGet({ env, params }) {
  const id = Number(params.id);

  if (!Number.isInteger(id)) {
    return json({
      success: false,
      error: "无效的 id"
    }, 400);
  }

  const item = await env.DB.prepare(`
    SELECT id, title, content, category, tags, created_at, updated_at
    FROM knowledge
    WHERE id = ?
  `).bind(id).first();

  if (!item) {
    return json({
      success: false,
      error: "记录不存在"
    }, 404);
  }

  return json({
    success: true,
    data: item
  });
}

// PUT /api/knowledge/1
// 修改一条知识
export async function onRequestPut({ env, params, request }) {
  const id = Number(params.id);

  if (!Number.isInteger(id)) {
    return json({
      success: false,
      error: "无效的 id"
    }, 400);
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
    UPDATE knowledge
    SET
      title = ?,
      content = ?,
      category = ?,
      tags = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
    .bind(title, content, category, tags, id)
    .run();

  if (result.meta.changes === 0) {
    return json({
      success: false,
      error: "记录不存在"
    }, 404);
  }

  return json({
    success: true,
    id
  });
}

// DELETE /api/knowledge/1
// 删除一条知识
export async function onRequestDelete({ env, params }) {
  const id = Number(params.id);

  if (!Number.isInteger(id)) {
    return json({
      success: false,
      error: "无效的 id"
    }, 400);
  }

  const result = await env.DB.prepare(`
    DELETE FROM knowledge
    WHERE id = ?
  `).bind(id).run();

  if (result.meta.changes === 0) {
    return json({
      success: false,
      error: "记录不存在"
    }, 404);
  }

  return json({
    success: true,
    id
  });
}