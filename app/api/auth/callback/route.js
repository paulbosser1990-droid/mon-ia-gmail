import { google } from 'googleapis'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectUrl = process.env.NEXTAUTH_URL + '/api/auth/callback'
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUrl
  )
  
  const { tokens } = await oauth2Client.getToken(code)
  
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
  const profile = await gmail.users.getProfile({ userId: 'me' })
  const emailUser = profile.data.emailAddress || ''
  
  const html = `<script>
    localStorage.setItem('gmail_token', '${tokens.access_token}');
    localStorage.setItem('gmail_email', '${emailUser}');
    window.location.href = '/';
  </script>`
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  })
}