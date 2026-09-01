import { projects } from './data/projects.js'
import './App.css'

function App() {
  return (
    <main className="landing">
      <div className="stage" aria-label="Portfolio landing">
        <img
          className="portrait"
          src="/me.jpg"
          alt="Portrait placeholder"
          width={320}
          height={320}
        />

        {projects.map((project) => (
          <a
            key={project.id}
            className="project-marker"
            href={project.href}
            title={project.title}
            aria-label={project.title}
            style={{
              left: `${project.x}%`,
              top: `${project.y}%`,
              width: project.size,
              height: project.size,
            }}
          >
            <img src={project.icon} alt="" width={project.size} height={project.size} />
          </a>
        ))}
      </div>
    </main>
  )
}

export default App
