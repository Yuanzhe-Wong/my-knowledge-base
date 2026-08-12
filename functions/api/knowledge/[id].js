function getId(context) {
  return Number(context.params.id);
}

export async function onRequestGet(context) {
  const { env } = context;
  const id = getId(context);

  const result = await env.DB.prepare(`
    SELECT *
    FROM knowledge
    WHERE id = ?1
  `)
    .bind(id)
    .first();

  if (!result) {
    return Response.json(
      {
        success: false,
        error: "知识不存在"
      },
      { status: 404 }
    );
  }

  return Response.json({
    success: true,
    data: result
  });
}

export async function onRequestPut(context) {
  const { request, env } = context;
  const id = getId(context);

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
      UPDATE knowledge
      SET
        title = ?1,
        content = ?2,
        category = ?3,
        tags = ?4,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?5
    `)
      .bind(
        title,
        content,
        category,
        JSON.stringify(tags),
        id
      )
      .run();

    if (result.meta.changes === 0) {
      return Response.json(
        {
          success: false,
          error: "知识不存在"
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: "修改成功"
    });
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

export async function onRequestDelete(context) {
  const { env } = context;
  const id = getId(context);

  const result = await env.DB.prepare(`
    DELETE FROM knowledge
    WHERE id = ?1
  `)
    .bind(id)
    .run();

  if (result.meta.changes === 0) {
    return Response.json(
      {
        success: false,
        error: "知识不存在"
      },
      { status: 404 }
    );
  }

  return Response.json({
    success: true,
    message: "删除成功"
  });
}