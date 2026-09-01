function LinkList({ links }) {
  const entries = [
    { key: 'demo', label: 'Live' },
    { key: 'repo', label: 'Code' },
    { key: 'video', label: 'Video' },
    { key: 'report', label: 'Report' },
  ].filter(({ key }) => links[key])

  if (entries.length === 0) {
    return <p className="project-card__links muted">Links coming soon</p>
  }

  return (
    <ul className="project-card__links">
      {entries.map(({ key, label }) => (
        <li key={key}>
          <a href={links[key]} target="_blank" rel="noreferrer">
            {label}
          </a>
        </li>
      ))}
    </ul>
  )
}

export default function ProjectCard({ project }) {
  return (
    <article className="project-card">
      <header className="project-card__header">
        <h3>{project.title}</h3>
        <ul className="project-card__tags">
          {project.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </header>
      <p>{project.summary}</p>
      <LinkList links={project.links} />
    </article>
  )
}
