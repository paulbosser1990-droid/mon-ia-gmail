import { google } from 'googleapis'

export async function GET() {
  const redirectUrl = process.env.NEXTAUTH_URL + '/api/auth/callback'
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUrl
  )
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send'
    ]
  })
  return Response.redirect(url)
}