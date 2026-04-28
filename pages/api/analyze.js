import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '../../lib/prisma'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { userId, idea, etapa, capital } = req.body

  if (!userId || !idea) {
    return res.status(400).json({ error: 'Datos incompletos' })
  }

  const etapaMap = {
    idea: 'solo tiene la idea en mente',
    validando: 'ya habló con algunos clientes potenciales',
    operando: 'ya está operando informalmente',
    formal: 'quiere formalizarse legalmente'
  }

  const capitalMap = {
    cero: '$0 de capital disponible',
    poco: 'menos de $500',
    medio: 'entre $500 y $2,000',
    bueno: 'entre $2,000 y $5,000',
    alto: 'más de $5,000'
  }

  const prompt = `Eres un asesor experto en emprendimiento en Panamá con 15 años de experiencia. Analiza esta idea de negocio con criterio real y honesto.

IDEA: "${idea}"
ETAPA: ${etapaMap[etapa] || etapa}
CAPITAL DISPONIBLE: ${capitalMap[capital] || capital}

Responde ÚNICAMENTE con un objeto JSON válido. Sin texto adicional, sin backticks, sin comentarios:

{
  "viabilidad": <número del 1 al 10>,
  "retorno": "<estimado ej: 3-6 meses>",
  "competencia": "<Baja|Media|Alta>",
  "resumen": "<evaluación honesta de 2-3 oraciones en contexto panameño>",
  "fortalezas": ["<fortaleza específica 1>", "<fortaleza 2>", "<fortaleza 3>"],
  "riesgos": ["<riesgo real 1>", "<riesgo 2>"],
  "pasos": ["<acción concreta esta semana>", "<acción semana 2>", "<acción mes 1>"],
  "tramites": ["<trámite legal Panamá 1>", "<trámite 2>", "<trámite 3>"],
  "modelo": "<modelo de negocio más viable en 2 oraciones>",
  "consejo_capital": "<consejo específico dado el capital disponible>",
  "inversionistas": ["<fuente de fondos relevante para esta idea>", "<fuente 2>"],
  "mercado_tamaño": "<estimado del mercado en Panamá>"
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })

    const raw = message.content[0].text
    const clean = raw.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    // Guardar análisis en DB
    await prisma.analysis.create({
      data: {
        userId,
        idea,
        etapa,
        capital,
        result
      }
    })

    return res.status(200).json({ success: true, result })
  } catch (error) {
    console.error('Analyze error:', error)
    return res.status(500).json({ error: 'Error al analizar. Intenta de nuevo.' })
  }
}
