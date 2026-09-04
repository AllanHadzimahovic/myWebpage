/**
 * Browser port of introdb.App (Javalin + DuckDB coffee shop).
 * Same pages, schema, and seed data as the Java app.
 */
const DB_KEY = 'introdb-coffeeshop-db'
const SESSION_KEY = 'introdb-coffeeshop-user'

const SEED = {
  users: [
    { username: 'Anna', email: 'anna@itu.dk', password: 'test' },
    { username: 'Martin', email: 'mhent@itu.dk', password: 'test' },
    { username: 'Omar', email: 'omsh@itu.dk', password: 'test' },
  ],
  products: [
    { productName: 'Tea', price: 20, description: 'Used for our large collection of delicious teas' },
    { productName: 'Small', price: 17, description: 'Espresso, Americano, Cortado, and Cappuccino' },
    { productName: 'Large', price: 20, description: 'Caffee latte, Chai latte, Macha latte, and cocoa' },
    { productName: 'Fancy', price: 25, description: 'Iced/dirty versions of Large drinks' },
  ],
  purchases: [
    { purchaseTime: '2026-02-11 09:55', productName: 'Tea', userName: 'Martin' },
    { purchaseTime: '2026-02-12 10:03', productName: 'Small', userName: 'Martin' },
    { purchaseTime: '2026-02-12 10:05', productName: 'Small', userName: 'Omar' },
    { purchaseTime: '2026-02-12 10:06', productName: 'Large', userName: 'Omar' },
    { purchaseTime: '2026-02-19 09:00', productName: 'Small', userName: 'Martin' },
  ],
}

function loadDb() {
  try {
    const parsed = JSON.parse(localStorage.getItem(DB_KEY) || '')
    if (parsed?.users && parsed?.products && parsed?.purchases) return parsed
  } catch {
    /* first visit or private mode */
  }
  return structuredClone(SEED)
}

function saveDb(db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {
    /* quota / private mode */
  }
}

function currentUser() {
  try {
    return sessionStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

function setUser(username) {
  try {
    if (username) sessionStorage.setItem(SESSION_KEY, username)
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* private mode */
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function route() {
  const hash = (location.hash || '#/').replace(/^#/, '')
  const path = hash.startsWith('/') ? hash : `/${hash}`
  return path.split('?')[0] || '/'
}

function go(path) {
  location.hash = path.startsWith('#') ? path : `#${path}`
}

function header(title, username) {
  let nav = `<a href="#/">Home</a> | <a href="#/products">Products</a> | <a href="#/purchases">All Purchases</a>`
  if (!username) {
    nav += ` | <a href="#/login">Login</a> | <a href="#/register">Register</a>`
  } else {
    nav += ` | <a href="#/my-purchases">My Purchases</a> | <a href="#/logout">Logout (${escapeHtml(username)})</a>`
  }
  return `<header><h1>${escapeHtml(title)}</h1><nav>${nav}</nav></header>`
}

function footer() {
  return `<footer><p>&copy; Introduction to Database Systems - Coffee Shop</p></footer>`
}

function render(title, inner) {
  document.title = title
  document.getElementById('app').innerHTML =
    `${header(title, currentUser())}<main>${inner}</main>${footer()}`
}

function homePage() {
  render(
    'Welcome to the Coffee Shop',
    `<div class="center-content">
      <img src="coffeeshop-logo.png" alt="Coffee Shop Logo">
      <p>Buy coffee online. Log in to make purchases.</p>
    </div>`,
  )
}

function productsPage() {
  const db = loadDb()
  const username = currentUser()
  const items = db.products
    .map((product) => {
      const action = username
        ? `<form data-action="purchase">
             <input type="hidden" name="productname" value="${escapeHtml(product.productName)}">
             <button type="submit">Buy</button>
           </form>`
        : `<p><em>Login to purchase</em></p>`
      return `<li class="product">
        <div>
          <h3>${escapeHtml(product.productName)} - DKK ${escapeHtml(product.price)}</h3>
          <p>${escapeHtml(product.description)}</p>
        </div>
        ${action}
      </li>`
    })
    .join('')
  render('Products', `<h2>Products</h2><ul class="product-list">${items}</ul>`)
}

function purchasesPage() {
  const rows = loadDb()
    .purchases.slice()
    .sort((a, b) => (a.purchaseTime < b.purchaseTime ? 1 : -1))
    .map(
      (p) =>
        `<tr><td>${escapeHtml(p.userName)}</td><td>${escapeHtml(p.productName)}</td><td>${escapeHtml(p.purchaseTime)}</td></tr>`,
    )
    .join('')
  render(
    'All Purchases',
    `<h2>All Purchases</h2>
     <table class="purchases"><thead><tr><th>User</th><th>Product</th><th>Time</th></tr></thead>
     <tbody>${rows}</tbody></table>`,
  )
}

function myPurchasesPage() {
  const username = currentUser()
  if (!username) {
    render('My Purchases', `<p class="flash">You must be logged in to view your purchases.</p>`)
    return
  }
  const rows = loadDb()
    .purchases.filter((p) => p.userName === username)
    .slice()
    .sort((a, b) => (a.purchaseTime < b.purchaseTime ? 1 : -1))
    .map((p) => `<tr><td>${escapeHtml(p.productName)}</td><td>${escapeHtml(p.purchaseTime)}</td></tr>`)
    .join('')
  render(
    'My Purchases',
    `<h2>My Purchases</h2>
     <table class="purchases"><thead><tr><th>Product</th><th>Time</th></tr></thead>
     <tbody>${rows}</tbody></table>`,
  )
}

function loginPage(message) {
  render(
    'Login',
    `${message ? `<p class="flash">${escapeHtml(message)}</p>` : ''}
     <form class="form" data-action="login">
       <label>Username: <input name="username" required></label><br>
       <label>Password: <input type="password" name="password" required></label><br>
       <button type="submit">Login</button>
     </form>
     <p>Don't have an account? <a href="#/register">Register</a></p>
     <p><em>Seed users from the Java app: Anna, Martin, Omar — password <code>test</code>.</em></p>`,
  )
}

function registerPage(message) {
  render(
    'Register',
    `${message ? `<p class="flash">${escapeHtml(message)}</p>` : ''}
     <form class="form" data-action="register">
       <label>Username: <input name="username" required></label><br>
       <label>Email: <input type="email" name="email" required></label><br>
       <label>Password: <input type="password" name="password" required></label><br>
       <button type="submit">Register</button>
     </form>`,
  )
}

function handleLogin(form) {
  const username = form.username.value.trim()
  const password = form.password.value
  const user = loadDb().users.find((u) => u.username === username && u.password === password)
  if (!user) {
    loginPage('Invalid username/password')
    return
  }
  setUser(user.username)
  go('/products')
}

function handleRegister(form) {
  const username = form.username.value.trim()
  const email = form.email.value.trim()
  const password = form.password.value
  if (!username || !email || !password) {
    registerPage('Missing username, email, or password')
    return
  }
  const db = loadDb()
  if (db.users.some((u) => u.username === username)) {
    registerPage('Registration failed')
    return
  }
  db.users.push({ username, email, password })
  saveDb(db)
  setUser(username)
  go('/products')
}

function handlePurchase(form) {
  const username = currentUser()
  if (!username) {
    render('Products', `<p class="flash">You must be logged in to purchase.</p>`)
    return
  }
  const productName = form.productname.value
  if (!productName) {
    render('Products', `<p class="flash">No product specified.</p>`)
    return
  }
  const db = loadDb()
  if (!db.products.some((p) => p.productName === productName)) {
    render('Products', `<p class="flash">Purchase failed</p>`)
    return
  }
  db.purchases.push({
    purchaseTime: new Date().toISOString(),
    productName,
    userName: username,
  })
  saveDb(db)
  go('/my-purchases')
}

function handleLogout() {
  setUser(null)
  go('/')
}

function draw() {
  const path = route()
  if (path === '/logout') {
    handleLogout()
    return
  }
  if (path === '/products') productsPage()
  else if (path === '/purchases') purchasesPage()
  else if (path === '/my-purchases') myPurchasesPage()
  else if (path === '/login' || path === '/login.html') loginPage()
  else if (path === '/register' || path === '/register.html') registerPage()
  else homePage()
}

document.addEventListener('submit', (event) => {
  const form = event.target
  if (!(form instanceof HTMLFormElement)) return
  const action = form.dataset.action
  if (!action) return
  event.preventDefault()
  if (action === 'login') handleLogin(form)
  else if (action === 'register') handleRegister(form)
  else if (action === 'purchase') handlePurchase(form)
})

window.addEventListener('hashchange', draw)
if (!location.hash) location.hash = '#/'
else draw()
