import { NextResponse } from 'next/server'
import { lireEmailsNonLus } from '@/lib/gmail'
import { analyserEmail } from '@/lib/gemini'
import { sauvegarderEmail, sauvegarderTache, getEmails } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { accessToken } = await request.json()
    console.log('Token recu:', accessToken ? 'OUI' : 'NON')

    const emailsBruts = await lireEmailsNonLus(accessToken)
    console.log('Emails trouves:', emailsBruts.length)

    const emailsAnalyses = []

    for (const email of emailsBruts.slice(0, 10)) {
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
          reponseSuggeree: '',
          repondu: false
        })
      }
    }

    const tousLesEmails = await getEmails()
    const emailsAvecStatut = emailsAnalyses.map(e => {
      const enBase = tousLesEmails.find(b => b.gmail_id === e.id)
      return { ...e, repondu: enBase?.repondu || false }
    })

    return NextResponse.json({ success: true, emails: emailsAvecStatut })
  } catch (error) {
    console.error('ERREUR:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}