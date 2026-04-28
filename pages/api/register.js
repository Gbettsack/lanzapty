import { prisma } from '../../lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, name } = req.body

  if (!email || !name) {
    return res.status(400).json({ error: 'Nombre y email son requeridos' })
  }

  const emailLower = email.toLowerCase().trim()

  try {
    // Crear o actualizar usuario
    await prisma.user.upsert({
      where: { email: emailLower },
      update: { name },
      create: { email: emailLower, name }
    })

    // Generar código de 6 dígitos válido por 15 minutos
    const code = generateCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.magicCode.create({
      data: { email: emailLower, code, expiresAt }
    })

    // Enviar email
    await resend.emails.send({
      from: 'PanamáLanza <noreply@tu-dominio.com>',
      to: emailLower,
      subject: `Tu código de acceso: ${code}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#0F6E56;margin-bottom:8px">PanamáLanza</h2>
          <p style="color:#444;margin-bottom:24px">Hola ${name}, aquí está tu código de acceso:</p>
          <div style="background:#E1F5EE;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
            <span style="font-size:36px;font-weight:700;color:#085041;letter-spacing:8px">${code}</span>
          </div>
          <p style="color:#888;font-size:13px">Este código expira en 15 minutos. Si no solicitaste acceso, ignora este email.</p>
        </div>
      `
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({ error: 'Error al registrar. Intenta de nuevo.' })
  }
}
