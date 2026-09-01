import { projects } from '../data/projects'
import ProjectCard from '../components/ProjectCard'

export default function Projects() {
  return (
    <section id="projects" className="section">
      <h2>Projects</h2>
      <p className="lede lede--compact">
        A short list of things I&apos;ve built — proof over padding.
      </p>
      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  )
}
