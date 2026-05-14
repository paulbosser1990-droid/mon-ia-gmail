import { NextResponse } from 'next/server'
import { lireEmailsNonLus } from '@/lib/gmail'
import { analyserEmail } from '@/lib/gemini'
import { sauvegarderEmail } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { accessToken } = await request.json()
    console.log('Token recu:', accessToken ? 'OUI' : 'NON')

    const emailsBruts = await lireEmailsNonLus(accessToken)
    console.log('Emails trouves:', emailsBruts.length)

    const emailsAnalyses = []

    for (const email of emailsBruts.slice(0, 3)) {
      try {
        const analyse = await analyserEmail(email)
        const emailComplet = { ...email, ...analyse }
        await sauvegarderEmail(emailComplet)
        emailsAnalyses.push(emailComplet)
        await new Promise(r => setTimeout(r, 2000))
      } catch (e) {
        console.error('Erreur email:', e.message)
        emailsAnalyses.push({
          ...email,
          priorite: 'normal',
          categorie: 'autre',
          resume: 'Analyse impossible pour le moment',
          reponseSuggeree: ''
        })
      }
    }

    return NextResponse.json({ success: true, emails: emailsAnalyses })
  } catch (error) {
    console.error('ERREUR:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}