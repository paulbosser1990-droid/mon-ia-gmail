import { google } from 'googleapis'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/api/auth/callback'
  )
  
  const { tokens } = await oauth2Client.getToken(code)
  
  const html = `<script>
    localStorage.setItem('gmail_token', '${tokens.access_token}');
    window.location.href = '/';
  </script>`
  
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  })
}