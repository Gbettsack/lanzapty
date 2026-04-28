import { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const [screen, setScreen] = useState('register') // register | verify | app | result
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingMsg, setLoadingMsg] = useState('')
  const [result, setResult] = useState(null)

  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [idea, setIdea] = useState('')
  const [etapa, setEtapa] = useState('idea')
  const [capital, setCapital] = useState('poco')

  const steps = {
    register: 0,
    verify: 1,
    app: 2,
    result: 3
  }

  // ---- REGISTER ----
  async function handleRegister(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setScreen('verify')
    } catch (err) {
      setError(err.message || 'Error al registrar')
    }
    setLoading(false)
  }

  // ---- VERIFY ----
  async function handleVerify(e) {
    e.preventDefault()
    if (code.length !== 6) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUser(data.user)
      setScreen('app')
    } catch (err) {
      setError(err.message || 'Código inválido')
    }
    setLoading(false)
  }

  // ---- ANALYZE ----
  async function handleAnalyze(e) {
    e.preventDefault()
    if (!idea.trim() || idea.trim().length < 15) {
      setError('Describe tu idea con un poco más de detalle')
      return
    }
    setLoading(true)
    setError('')

    const msgs = [
      'Analizando viabilidad en el mercado panameño...',
      'Evaluando competencia local...',
      'Calculando costos de arranque...',
      'Generando tu plan de acción...',
      'Revisando trámites legales...'
    ]
    let i = 0
    setLoadingMsg(msgs[0])
    const iv = setInterval(() => {
      i = (i + 1) % msgs.length
      setLoadingMsg(msgs[i])
    }, 2000)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, idea: idea.trim(), etapa, capital })
      })
      const data = await res.json()
      clearInterval(iv)
      if (!res.ok) throw new Error(data.error)
      setResult(data.result)
      setScreen('result')
    } catch (err) {
      clearInterval(iv)
      setError(err.message || 'Error al analizar')
    }
    setLoading(false)
  }

  function viabilidadColor(v) {
    if (v >= 8) return '#1D9E75'
    if (v >= 5) return '#BA7517'
    return '#E24B4A'
  }

  function StepBar() {
    const cur = steps[screen]
    return (
      <div className="steps">
        {[0,1,2,3].map(i => (
          <div key={i} className={`step-bar ${i < cur ? 'active' : i === cur ? 'current' : ''}`}/>
        ))}
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>PanamáLanza — Valida tu idea de negocio</title>
        <meta name="description" content="Valida tu idea de negocio en Panamá con inteligencia artificial. Gratis." />
        <meta property="og:title" content="PanamáLanza — Valida tu idea de negocio con IA" />
        <meta property="og:description" content="Describe tu idea y recibe en minutos: viabilidad, plan de acción y trámites en Panamá. Gratis." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <div className="header">
          <div className="logo">Panamá<span>Lanza</span></div>
          <div className="tagline">Valida tu idea de negocio con IA — gratis</div>
        </div>

        <StepBar />

        {/* REGISTRO */}
        {screen === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="card">
              <div className="card-label">Crea tu cuenta gratis</div>
              <input
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ marginBottom: 10 }}
                required
              />
              <input
                type="email"
                placeholder="Tu email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Enviando código...' : 'Continuar — recibe tu código por email'}
            </button>
          </form>
        )}

        {/* VERIFICAR */}
        {screen === 'verify' && (
          <form onSubmit={handleVerify}>
            <div className="card">
              <div className="card-label">Código de acceso</div>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 14 }}>
                Te enviamos un código de 6 dígitos a <strong>{email}</strong>. Revisa tu bandeja de entrada (y spam).
              </p>
              <input
                type="text"
                className="code-input"
                placeholder="000000"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                required
              />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading || code.length !== 6}>
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
            <div style={{ textAlign: 'center' }}>
              <button type="button" className="btn-link" onClick={() => { setScreen('register'); setCode(''); setError('') }}>
                Cambiar email
              </button>
            </div>
          </form>
        )}

        {/* APP - FORMULARIO IDEA */}
        {screen === 'app' && (
          <form onSubmit={handleAnalyze}>
            <div className="card">
              <div className="card-label">Hola {user?.name?.split(' ')[0]} — describe tu idea</div>
              <textarea
                placeholder="Ej: Quiero vender comida típica panameña por delivery en oficinas del área bancaria de Ciudad de Panamá..."
                value={idea}
                onChange={e => setIdea(e.target.value)}
              />
            </div>
            <div className="card">
              <div className="card-label">¿En qué etapa estás?</div>
              <select value={etapa} onChange={e => setEtapa(e.target.value)}>
                <option value="idea">Solo tengo la idea</option>
                <option value="validando">Ya hablé con algunos clientes</option>
                <option value="operando">Ya estoy operando informalmente</option>
                <option value="formal">Quiero formalizarme</option>
              </select>
            </div>
            <div className="card">
              <div className="card-label">Capital inicial disponible</div>
              <select value={capital} onChange={e => setCapital(e.target.value)}>
                <option value="cero">Sin capital ($0)</option>
                <option value="poco">Menos de $500</option>
                <option value="medio">$500 – $2,000</option>
                <option value="bueno">$2,000 – $5,000</option>
                <option value="alto">Más de $5,000</option>
              </select>
            </div>

            {loading && (
              <div className="card">
                <div className="loading">
                  <div className="dot"/><div className="dot"/><div className="dot"/>
                  <span>{loadingMsg}</span>
                </div>
              </div>
            )}

            {error && <p className="error-msg">{error}</p>}

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Analizando...' : 'Analizar mi idea'}
            </button>
          </form>
        )}

        {/* RESULTADO */}
        {screen === 'result' && result && (
          <div>
            <div className="metrics">
              <div className="metric">
                <div className="metric-value" style={{ color: viabilidadColor(result.viabilidad) }}>
                  {result.viabilidad}/10
                </div>
                <div className="metric-label">Viabilidad</div>
              </div>
              <div className="metric">
                <div className="metric-value" style={{ fontSize: 15 }}>{result.retorno}</div>
                <div className="metric-label">Retorno</div>
              </div>
              <div className="metric">
                <div className="metric-value" style={{ fontSize: 15 }}>{result.competencia}</div>
                <div className="metric-label">Competencia</div>
              </div>
            </div>

            <div className="result-section">
              <div className="result-label">Evaluación</div>
              <div className="result-text">{result.resumen}</div>
            </div>

            <div className="result-section">
              <div className="result-label">Tamaño de mercado</div>
              <div className="result-text">{result.mercado_tamaño}</div>
            </div>

            <div className="result-section">
              <div className="result-label">Fortalezas</div>
              <div>{result.fortalezas?.map((f,i) => <span key={i} className="badge badge-green">{f}</span>)}</div>
            </div>

            <div className="result-section">
              <div className="result-label">Riesgos</div>
              <div>{result.riesgos?.map((r,i) => <span key={i} className="badge badge-amber">{r}</span>)}</div>
            </div>

            <div className="result-section">
              <div className="result-label">Modelo recomendado</div>
              <div className="result-text">{result.modelo}</div>
            </div>

            <div className="result-section">
              <div className="result-label">Primeros pasos concretos</div>
              <div className="result-text">{result.pasos?.map((p,i) => `${i+1}. ${p}`).join('\n')}</div>
            </div>

            <div className="result-section">
              <div className="result-label">Trámites en Panamá</div>
              <div>{result.tramites?.map((t,i) => <span key={i} className="badge badge-blue">{t}</span>)}</div>
            </div>

            <div className="result-section">
              <div className="result-label">Dónde buscar inversión</div>
              <div>{result.inversionistas?.map((inv,i) => <span key={i} className="badge badge-blue">{inv}</span>)}</div>
            </div>

            <div className="result-section">
              <div className="result-label">Consejo según tu capital</div>
              <div className="result-text">{result.consejo_capital}</div>
            </div>

            <button className="btn-primary" style={{ marginTop: 8 }}
              onClick={() => { setIdea(''); setResult(null); setScreen('app') }}>
              Analizar otra idea
            </button>
            <div style={{ textAlign: 'center' }}>
              <button className="reset-btn" onClick={() => {
                setUser(null); setScreen('register')
                setName(''); setEmail(''); setCode('')
              }}>
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
