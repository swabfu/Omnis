// Get current tab info
browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const currentTab = tabs[0]
  const urlDisplay = document.getElementById('urlDisplay')
  urlDisplay.textContent = currentTab.url || 'No URL found'
})

// Load saved API URL
browser.storage.local.get(['apiUrl'], (result) => {
  if (result.apiUrl) {
    document.getElementById('apiUrl').value = result.apiUrl
  } else {
    document.getElementById('apiUrl').value = 'http://localhost:3000/api/items'
  }
})

// Save API URL on change
document.getElementById('apiUrl').addEventListener('change', (e) => {
  browser.storage.local.set({ apiUrl: e.target.value })
})

// Save button click handler
document.getElementById('saveBtn').addEventListener('click', async () => {
  const saveBtn = document.getElementById('saveBtn')
  const message = document.getElementById('message')

  saveBtn.disabled = true
  saveBtn.textContent = 'Saving...'
  message.className = 'message'
  message.textContent = ''

  try {
    // Get current tab
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    const currentTab = tabs[0]

    // Get API URL
    const storage = await browser.storage.local.get(['apiUrl'])
    const apiUrl = storage.apiUrl || 'http://localhost:3000/api/items'

    // Send to API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: currentTab.url,
        title: currentTab.title,
        type: currentTab.url.match(/(twitter|x)\.com/) ? 'tweet' : 'link'
      })
    })

    if (response.ok) {
      message.textContent = 'Saved successfully!'
      message.className = 'message success'
      saveBtn.textContent = 'Saved!'
      setTimeout(() => {
        window.close()
      }, 1500)
    } else {
      throw new Error('Failed to save')
    }
    } catch {
    message.textContent = 'Error: Could not save. Make sure Omnis is running.'
    message.className = 'message error'
    saveBtn.disabled = false
    saveBtn.textContent = 'Try Again'
  }
})
