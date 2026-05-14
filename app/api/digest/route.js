import { NextResponse } from 'next/server'
import { getEmails, sauvegarderDigest } from '@/lib/supabase'

export async function GET() {
  try {
    const emails = await getEmails()
    const today = new Date().toISOString().split('T')[0]
    const emailsDuJour = emails.filter(e => e.date && e.date.startsWith(today))
    const nbUrgents = emailsDuJour.filter(e => e.priorite === 'urgent').length
    const nbTraites = emailsDuJour.filter(e => e.repondu).length
    const digest = {
      nbMailsTotal: emailsDuJour.length,
      nbUrgents,
      nbTraites,
      resumeJour: `Aujourd'hui vous avez recu ${emailsDuJour.length} emails dont ${nbUrgents} urgents et ${nbTraites} traites.`,
      opportunites: 'Analyse IA disponible apres activation facturation',
      alertes: nbUrgents > 0 ? `${nbUrgents} emails urgents en attente` : 'Aucune alerte'
    }
    await sauvegarderDigest(digest)
    return NextResponse.json({ success: true, digest })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}