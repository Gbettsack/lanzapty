import { prisma } from '../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, code } = req.body

  if (!email || !code) {
    return res.status(400).json({ error: 'Email y código requeridos' })
  }

  try {
    const emailLower = email.toLowerCase().trim()

    const magicCode = await prisma.magicCode.findFirst({
      where: {
        email: emailLower,
        code: code.trim(),
        used: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!magicCode) {
      return res.status(400).json({ error: 'Código inválido o expirado' })
    }

    // Marcar como usado
    await prisma.magicCode.update({
      where: { id: magicCode.id },
      data: { used: true }
    })

    const user = await prisma.user.findUnique({
      where: { email: emailLower }
    })

    return res.status(200).json({ success: true, user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    console.error('Verify error:', error)
    return res.status(500).json({ error: 'Error al verificar. Intenta de nuevo.' })
  }
}
