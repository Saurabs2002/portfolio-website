import cors from 'cors'
import express from 'express'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/portfolio'
})

const initialPortfolio = {
  name: 'Saurabh Singh',
  role: 'DevOps Engineer',
  intro: 'I build reliable delivery systems across AWS, Kubernetes, and CI/CD, helping teams ship secure software with confidence.',
  location: 'Delhi NCR · India',
  email: 'saurabh135230@gmail.com',
  availability: 'Open to DevOps and cloud infrastructure opportunities',
  stats: [
    { value: '02+', label: 'Years experience' },
    { value: '15+', label: 'Jenkins pipelines' },
    { value: '70%', label: 'Faster deployments' }
  ],
  services: ['AWS cloud infrastructure', 'CI/CD and DevSecOps', 'Kubernetes, Helm and Argo CD', 'Terraform and Infrastructure as Code'],
  projects: [
    { title: 'TCS · Nationwide Bank', type: 'DevOps Engineer · Oct 2024–Present', year: '01', description: 'Supporting cloud infrastructure, application delivery, and automation for a UK-based BFSI project.', accent: 'sun' },
    { title: 'Banking GitOps', type: 'CAO · SAO · CCO applications', year: '02', description: 'Standardized Jenkins, Docker, SonarQube, Trivy, Argo CD, Helm, and Amazon EKS delivery workflows.', accent: 'ink' },
    { title: 'Secure releases', type: 'DevSecOps implementation', year: '03', description: 'Automated releases, reducing manual deployment effort by 60% while improving release consistency.', accent: 'mint' }
  ],
  socials: [
    { label: 'LinkedIn', url: 'https://www.linkedin.com' },
    { label: 'LeetCode', url: 'https://leetcode.com' },
    { label: 'GitHub', url: 'https://github.com' }
  ]
}

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS portfolio (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      intro TEXT NOT NULL,
      location TEXT NOT NULL,
      email TEXT NOT NULL,
      availability TEXT NOT NULL,
      stats JSONB NOT NULL,
      services JSONB NOT NULL,
      projects JSONB NOT NULL,
      socials JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  const { rows: [countRow] } = await pool.query('SELECT COUNT(*)::int AS count FROM portfolio WHERE id = 1')
  if (!countRow.count) {
    await pool.query(
      `INSERT INTO portfolio (id, name, role, intro, location, email, availability, stats, services, projects, socials)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        initialPortfolio.name,
        initialPortfolio.role,
        initialPortfolio.intro,
        initialPortfolio.location,
        initialPortfolio.email,
        initialPortfolio.availability,
        JSON.stringify(initialPortfolio.stats),
        JSON.stringify(initialPortfolio.services),
        JSON.stringify(initialPortfolio.projects),
        JSON.stringify(initialPortfolio.socials)
      ]
    )
  }

  const { rows: [currentRow] } = await pool.query('SELECT name FROM portfolio WHERE id = 1')
  if (currentRow?.name === 'Alex Morgan') {
    await pool.query(
      `UPDATE portfolio
       SET name = $1,
           role = $2,
           intro = $3,
           location = $4,
           email = $5,
           availability = $6,
           stats = $7,
           services = $8,
           projects = $9,
           socials = $10,
           updated_at = NOW()
       WHERE id = 1`,
      [
        initialPortfolio.name,
        initialPortfolio.role,
        initialPortfolio.intro,
        initialPortfolio.location,
        initialPortfolio.email,
        initialPortfolio.availability,
        JSON.stringify(initialPortfolio.stats),
        JSON.stringify(initialPortfolio.services),
        JSON.stringify(initialPortfolio.projects),
        JSON.stringify(initialPortfolio.socials)
      ]
    )
  }
}

async function readPortfolio() {
  const { rows: [row] } = await pool.query('SELECT * FROM portfolio WHERE id = 1')
  if (!row) return null

  return {
    name: row.name,
    role: row.role,
    intro: row.intro,
    location: row.location,
    email: row.email,
    availability: row.availability,
    stats: row.stats,
    services: row.services,
    projects: row.projects,
    socials: row.socials,
    updatedAt: row.updated_at
  }
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.get('/api/portfolio', async (_req, res) => {
  const portfolio = await readPortfolio()
  if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' })
  res.json(portfolio)
})

app.put('/api/portfolio', async (req, res) => {
  const body = req.body
  const required = ['name', 'role', 'intro', 'location', 'email', 'availability', 'stats', 'services', 'projects', 'socials']
  const valid = required.every((key) => body[key] !== undefined)
  if (!valid) return res.status(400).json({ error: 'All portfolio fields are required.' })

  await pool.query(
    `UPDATE portfolio
     SET name = $1,
         role = $2,
         intro = $3,
         location = $4,
         email = $5,
         availability = $6,
         stats = $7,
         services = $8,
         projects = $9,
         socials = $10,
         updated_at = NOW()
     WHERE id = 1`,
    [
      body.name,
      body.role,
      body.intro,
      body.location,
      body.email,
      body.availability,
      JSON.stringify(body.stats),
      JSON.stringify(body.services),
      JSON.stringify(body.projects),
      JSON.stringify(body.socials)
    ]
  )

  const portfolio = await readPortfolio()
  res.json(portfolio)
})

const port = process.env.PORT || 4000

async function start() {
  await initDatabase()
  app.listen(port, () => console.log(`Portfolio API listening on http://localhost:${port}`))
}

start().catch((error) => {
  console.error('Failed to start portfolio API:', error)
  process.exit(1)
})
