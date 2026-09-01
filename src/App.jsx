import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Intro from './sections/Intro'
import About from './sections/About'
import Projects from './sections/Projects'
import Contact from './sections/Contact'
import './App.css'

function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Intro />
        <About />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default App
