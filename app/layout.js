export default function RootLayout({ children }) {
  return (
    <html lang="fr" style={{margin:0,padding:0}}>
      <body style={{margin:0,padding:0,minHeight:'100vh',background:'#0f0f1a'}}>
        {children}
      </body>
    </html>
  )
}