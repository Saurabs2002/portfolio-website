import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [portfolio, setPortfolio] = useState(null)
  const [editing, setEditing] = useState(false)
  const [draftIntro, setDraftIntro] = useState('')
  const [saving, setSaving] = useState(false)
  const apiUrl = import.meta.env.VITE_API_URL || '/api'

  useEffect(() => {
    fetch(`${apiUrl}/portfolio`).then((response) => response.json()).then((data) => { setPortfolio(data); setDraftIntro(data.intro) }).catch(() => setPortfolio(null))
  }, [apiUrl])

  const saveIntro = async (event) => {
    event.preventDefault()
    setSaving(true)
    const current = await (await fetch(`${apiUrl}/portfolio`)).json()
    const saved = await fetch(`${apiUrl}/portfolio`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...current, intro: draftIntro }) })
    setPortfolio(await saved.json())
    setSaving(false)
    setEditing(false)
  }

  if (!portfolio) return <main className="loading">Connecting to your portfolio database...</main>

  return (
    <main>
      <nav className="nav"><a className="wordmark" href="#top">SS<span>.</span></a><div className="nav-links"><a href="#work">Experience</a><a href="#about">Skills</a><a href={`mailto:${portfolio.email}`}>Let's talk <span>↗</span></a></div></nav>
      <section className="hero" id="top"><div className="eyebrow"><span className="status-dot" /> {portfolio.availability}</div><h1>{portfolio.name}<br /><em>{portfolio.role}</em></h1><div className="hero-bottom"><p className="intro">{portfolio.intro}</p><div className="scroll-cue">Scroll to explore <span>↓</span></div></div></section>
      <section className="stats" id="about">{portfolio.stats.map((stat) => <div className="stat" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}<div className="stat location"><strong>✳</strong><span>{portfolio.location}</span></div></section>
      <section className="work" id="work"><div className="section-heading"><span>( 01 )</span><h2>Experience & projects</h2><span className="muted">Cloud delivery, automation, and GitOps in practice.</span></div><div className="project-grid">{portfolio.projects.map((project, index) => <article className={`project ${project.accent}`} key={project.title}><div className="project-art"><span className="project-number">0{index + 1}</span><div className="art-shape" /><span className="art-label">{project.type}</span></div><div className="project-meta"><div><h3>{project.title}</h3><p>{project.description}</p></div><span>{project.year}</span></div></article>)}</div></section>
      <section className="services"><div className="section-heading"><span>( 02 )</span><h2>Technical toolkit</h2><span className="muted">The systems and tools behind the work.</span></div><div className="service-list">{portfolio.services.map((service, index) => <div className="service" key={service}><span>0{index + 1}</span><h3>{service}</h3><span className="arrow">↗</span></div>)}</div></section>
      <footer><div><span className="eyebrow">AWS · Kubernetes · CI/CD</span><h2>Let's build<br /><em>reliable systems.</em></h2></div><div className="footer-right"><a className="email" href={`mailto:${portfolio.email}`}>{portfolio.email} <span>↗</span></a><div className="socials">{portfolio.socials.map((social) => <a href={social.url} key={social.label} target="_blank" rel="noreferrer">{social.label} ↗</a>)}</div><button className="edit-button" onClick={() => setEditing(true)}>Edit portfolio content</button></div></footer>
      {editing && <div className="modal-backdrop" onClick={() => setEditing(false)}><form className="editor" onSubmit={saveIntro} onClick={(event) => event.stopPropagation()}><div className="editor-head"><h2>Update intro</h2><button type="button" onClick={() => setEditing(false)}>×</button></div><label htmlFor="intro">Your opening statement</label><textarea id="intro" value={draftIntro} onChange={(event) => setDraftIntro(event.target.value)} rows="5" /><button className="save-button" type="submit">{saving ? 'Saving...' : 'Save to database'}</button><small>Changes are saved through the Express API into SQLite.</small></form></div>}
    </main>
  )
}

export default App
