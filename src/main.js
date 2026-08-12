import './style.css'
import { notes } from './data/notes.js'

const searchInput = document.querySelector('#search-input')
const notesList = document.querySelector('#notes-list')

function renderNotes(keyword = '') {
  const normalizedKeyword = keyword.toLowerCase().trim()

  const filteredNotes = notes.filter((note) => {
    const text = [
      note.title,
      note.type,
      note.summary,
      ...note.tags
    ].join(' ').toLowerCase()

    return text.includes(normalizedKeyword)
  })

  notesList.innerHTML = filteredNotes
    .map((note) => {
      return `
        <article class="note-card">
          <h2>${note.title}</h2>
          <p class="note-type">${note.type}</p>
          <p>${note.summary}</p>
          <div>
            ${note.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </article>
      `
    })
    .join('')
}

searchInput.addEventListener('input', (event) => {
  renderNotes(event.target.value)
})

renderNotes()