import { profile } from '../data/profile'
import { projects } from '../data/projects'
import ProjectCard from '../components/ProjectCard'

export default function Intro() {
  const featured = projects.filter((p) => p.featured).slice(0, 3)

  return (
    <section id="intro" className="section section--intro">
      <p className="eyebrow">Portfolio · {profile.location}</p>
      <h1>
        Hi, I&apos;m {profile.shortName}
        <span className="accent">.</span>
      </h1>
      <p className="lede">{profile.headline}</p>
      <p className="intro__blurb">{profile.blurb}</p>

      <div className="cta-row">
        <a className="button button--primary" href="#projects">
          See projects
        </a>
        <a className="button button--ghost" href="#contact">
          Contact
        </a>
        {profile.links.cv ? (
          <a className="button button--ghost" href={profile.links.cv}>
            Download CV
          </a>
        ) : null}
      </div>

      <div className="intro__featured">
        <h2 className="section__subhead">Featured work</h2>
        <div className="project-grid">
          {featured.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}
