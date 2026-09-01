import { profile } from '../data/profile'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <p>
        © {year} {profile.name}
      </p>
      <p className="footer__note">Built with React · Hosted on GitHub Pages (soon)</p>
    </footer>
  )
}
