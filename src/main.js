import './style.css'

const button = document.querySelector('#hello-button')
const result = document.querySelector('#result')

button.addEventListener('click', async () => {
  result.textContent = '正在请求后端...'

  try {
    const response = await fetch('/api/hello')
    const data = await response.json()

    result.textContent = data.message
  } catch (error) {
    result.textContent = '请求后端失败：' + error.message
  }
})