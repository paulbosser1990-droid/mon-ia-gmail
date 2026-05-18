import { google } from 'googleapis'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const redirectUrl = process.env.NEXTAUTH_URL + '/api/auth/callback'
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUrl
    )
    
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    
    let emailUser = ''
    try {
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
      const profile = await gmail.users.getProfile({ userId: 'me' })
      emailUser = profile.data.emailAddress || ''
    } catch (e) {
      emailUser = ''
    }
    
    const html = `<script>
      localStorage.setItem('gmail_token', '${tokens.access_token}');
      localStorage.setItem('gmail_email', '${emailUser}');
      window.location.href = '/';
    </script>`
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    })
  } catch (error) {
    return new Response('Erreur: ' + error.message, { status: 500 })
  }
}