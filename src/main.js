import "./style.css";

const API = "/api/knowledge";

const app = document.querySelector("#app");

let editingId = null;

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

app.innerHTML = `
  <main class="container">
    <header class="header">
      <div>
        <h1>我的知识库</h1>
        <p>通过 Cloudflare Pages 管理 D1 数据库内容</p>
      </div>
      <button id="refreshBtn" class="secondary">刷新列表</button>
    </header>
<!---->
    <section class="panel">
      <h2 id="formTitle">新增知识</h2>
<!---->
      <form id="knowledgeForm">
        <label>
          标题
          <input id="title" type="text" placeholder="请输入标题" required />
        </label>
<!---->
        <label>
          内容
          <textarea id="content" rows="8" placeholder="请输入知识内容" required></textarea>
        </label>
<!---->
        <div class="row">
          <label>
            分类
            <input id="category" type="text" placeholder="例如：Cloudflare" />
          </label>
<!---->
          <label>
            标签
            <input id="tags" type="text" placeholder="例如：D1,数据库" />
          </label>
        
</div>
<!---->
<!---->
<!---->
        <div class="actions">
          <button id="submitBtn" type="submit">保存</button>
          <button id="cancelBtn" type="button" class="secondary hidden">取消编辑</button>
        </div>
      </form>
<!---->
      <p id="message"></p>
    
</section>


<!---->
    <section class="panel">
      <div class="listHeader">
        <h2>知识列表</h2>
        <input id="searchInput" type="search" placeholder="搜索标题、内容或标签" />
      </div>
      <div id="list">正在加载……</div>
    </section>
  
</main>


`;

const form = document.querySelector("#knowledgeForm");
const titleInput = document.querySelector("#title");
const contentInput = document.querySelector("#content");
const categoryInput = document.querySelector("#category");
const tagsInput = document.querySelector("#tags");
const searchInput = document.querySelector("#searchInput");
const list = document.querySelector("#list");
const message = document.querySelector("#message");
const formTitle = document.querySelector("#formTitle");
const submitBtn = document.querySelector("#submitBtn");
const cancelBtn = document.querySelector("#cancelBtn");
const refreshBtn = document.querySelector("#refreshBtn");

function showMessage(text, type = "success") {
  message.textContent = text;
  message.className = type;

  setTimeout(() => {
    message.textContent = "";
    message.className = "";
  }, 3000);
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.error || `请求失败：${response.status}`);
  }

  return data;
}

async function loadList() {
  list.innerHTML = "正在加载……";

  try {
    const keyword = searchInput.value.trim();
    const url = keyword
      ? `${API}?keyword=${encodeURIComponent(keyword)}`
      : API;

    const result = await request(url);
    renderList(result.data || []);
  } catch (error) {
    list.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
  }
}

function renderList(items) {
  if (items.length === 0) {
    list.innerHTML = `<div class="empty">暂无知识内容</div>`;
    return;
  }

  list.innerHTML = items.map(item => `
    <article class="item">
      <div class="itemTop">
        <h3>${escapeHtml(item.title)}</h3>
        <span class="id">#${item.id}</span>
      </div>
<!---->
      <div class="meta">
        ${item.category ? `<span>分类：${escapeHtml(item.category)}</span>` : ""}
        ${item.tags ? `<span>标签：${escapeHtml(item.tags)}</span>` : ""}
        <span>更新时间：${escapeHtml(item.updated_at || "")}</span>
      </div>
<!---->
      <p class="content">${escapeHtml(item.content)}</p>
<!---->
      <div class="itemActions">
        <button class="editBtn" data-id="${item.id}">编辑</button>
        <button class="deleteBtn danger" data-id="${item.id}">删除</button>
      </div>
    
</article>


  `).join("");

  document.querySelectorAll(".editBtn").forEach(button => {
    button.addEventListener("click", () => editItem(button.dataset.id));
  });

  document.querySelectorAll(".deleteBtn").forEach(button => {
    button.addEventListener("click", () => deleteItem(button.dataset.id));
  });
}

async function editItem(id) {
  try {
    const result = await request(`${API}/${id}`);
    const item = result.data;

    editingId = id;
    titleInput.value = item.title || "";
    contentInput.value = item.content || "";
    categoryInput.value = item.category || "";
    tagsInput.value = item.tags || "";

    formTitle.textContent = `编辑知识 #${id}`;
    submitBtn.textContent = "保存修改";
    cancelBtn.classList.remove("hidden");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function deleteItem(id) {
  if (!confirm(`确定要删除第 ${id} 条知识吗？`)) {
    return;
  }

  try {
    await request(`${API}/${id}`, {
      method: "DELETE"
    });

    showMessage("删除成功");
    await loadList();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function resetForm() {
  editingId = null;
  form.reset();
  formTitle.textContent = "新增知识";
  submitBtn.textContent = "保存";
  cancelBtn.classList.add("hidden");
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  const body = {
    title: titleInput.value.trim(),
    content: contentInput.value.trim(),
    category: categoryInput.value.trim(),
    tags: tagsInput.value.trim()
  };

  try {
    if (editingId) {
      await request(`${API}/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      showMessage("修改成功");
    } else {
      await request(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      showMessage("新增成功");
    }

    resetForm();
    await loadList();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

cancelBtn.addEventListener("click", resetForm);
refreshBtn.addEventListener("click", loadList);

let searchTimer;

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadList, 300);
});

loadList();

