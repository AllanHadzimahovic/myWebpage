import { profile } from '../data/profile'

export default function About() {
  return (
    <section id="about" className="section">
      <h2>About</h2>
      <p className="lede lede--compact">
        Clear story first — personality can live in the details.
      </p>

      <div className="about__grid">
        <div>
          <h3>Background</h3>
          <p>{profile.blurb}</p>
          <ul className="stack-list">
            {profile.credentials.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Education</h3>
          <ul className="stack-list">
            {profile.education.map((edu) => (
              <li key={edu.school}>
                <strong>{edu.school}</strong>
                <br />
                {edu.detail}
                {edu.years ? ` · ${edu.years}` : ''}
              </li>
            ))}
          </ul>
        </div>

        <div className="about__skills">
          <h3>Skills</h3>
          {Object.entries(profile.skills).map(([group, items]) => (
            <div key={group} className="skill-group">
              <h4>{group}</h4>
              <ul className="chip-list">
                {items.map((skill) => (
                  <li key={skill}>{skill}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
