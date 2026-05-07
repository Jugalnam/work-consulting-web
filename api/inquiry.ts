import nodemailer from 'nodemailer'

type Req = {
  method: string
  body: { name: string; contact: string; topic: string; message: string }
}

type Res = {
  status(code: number): Res
  json(data: unknown): void
  end(): void
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, contact, topic, message } = req.body

  const gmailUser = process.env.GMAIL_USER
  const gmailPass = process.env.GMAIL_PASS
  if (!gmailUser || !gmailPass) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass },
  })

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#1a1a1a">직장 고민 상담 문의가 접수되었습니다</h2>
      <table style="width:100%;border-collapse:collapse;margin-top:16px">
        <tr style="border-bottom:1px solid #e5e7eb">
          <td style="padding:12px;font-weight:600;color:#525252;width:100px">이름</td>
          <td style="padding:12px;color:#0a0a0a">${name}</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb">
          <td style="padding:12px;font-weight:600;color:#525252">연락처</td>
          <td style="padding:12px;color:#0a0a0a">${contact}</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb">
          <td style="padding:12px;font-weight:600;color:#525252">주제</td>
          <td style="padding:12px;color:#0a0a0a">${topic}</td>
        </tr>
        <tr>
          <td style="padding:12px;font-weight:600;color:#525252;vertical-align:top">내용</td>
          <td style="padding:12px;color:#0a0a0a;white-space:pre-wrap">${message}</td>
        </tr>
      </table>
    </div>
  `

  try {
    await transporter.sendMail({
      from: `"직장 고민 상담" <${gmailUser}>`,
      to: gmailUser,
      ...(contact.includes('@') ? { replyTo: contact } : {}),
      subject: `[직장 고민 상담] ${topic} 문의 - ${name}`,
      html,
    })
  } catch (e) {
    console.error('[inquiry] Gmail error:', e)
    return res.status(500).json({ error: '메일 발송에 실패했습니다.' })
  }

  return res.status(200).json({ ok: true })
}
