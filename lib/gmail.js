import { google } from 'googleapis'

export function creerClientGmail(accessToken) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
  auth.setCredentials({ access_token: accessToken })
  return google.gmail({ version: 'v1', auth })
}

export async function lireEmailsNonLus(accessToken) {
  const gmail = creerClientGmail(accessToken)
  const response = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 20,
    q: 'is:unread'
  })
  if (!response.data.messages) return []
  const emails = await Promise.all(
    response.data.messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full'
      })
      return extraireInfosEmail(detail.data)
    })
  )
  return emails
}

function extraireInfosEmail(emailBrut) {
  const headers = emailBrut.payload.headers
  const getHeader = (name) =>
    headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || ''
  let contenu = ''
  if (emailBrut.payload.body?.data) {
    contenu = Buffer.from(emailBrut.payload.body.data, 'base64').toString('utf-8')
  } else if (emailBrut.payload.parts) {
    const textPart = emailBrut.payload.parts.find(p => p.mimeType === 'text/plain')
    if (textPart?.body?.data) {
      contenu = Buffer.from(textPart.body.data, 'base64').toString('utf-8')
    }
  }
  return {
    id: emailBrut.id,
    date: new Date(parseInt(emailBrut.internalDate)).toISOString(),
    expediteur: getHeader('from'),
    sujet: getHeader('subject'),
    contenu: contenu.substring(0, 2000).replace(/[\x00-\x1F\x7F]/g, ' ')
  }
}

export async function envoyerReponse(accessToken, emailId, reponse, expediteur, sujet) {
  const gmail = creerClientGmail(accessToken)
  const message = [
    `To: ${expediteur}`,
    `Subject: Re: ${sujet}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    reponse
  ].join('\n')
  const encodedMessage = Buffer.from(message).toString('base64url')
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage }
  })
}