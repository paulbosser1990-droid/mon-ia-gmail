import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function sauvegarderEmail(email) {
  const { data, error } = await supabase
    .from('emails')
    .upsert({
      gmail_id: email.id,
      date: email.date,
      expediteur: email.expediteur,
      sujet: email.sujet,
      contenu: email.contenu,
      priorite: email.priorite,
      categorie: email.categorie,
      resume: email.resume,
      reponse_suggeree: email.reponseSuggeree
    }, { onConflict: 'gmail_id' })
  if (error) console.error('Erreur:', error)
  return data
}

export async function getEmails() {
  const { data, error } = await supabase
    .from('emails')
    .select('*')
    .order('date', { ascending: false })
  if (error) console.error('Erreur:', error)
  return data || []
}

export async function sauvegarderTache(tache) {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      titre: tache.titre,
      description: tache.description,
      priorite: tache.priorite,
      deadline: tache.deadline,
      email_id: tache.emailId
    })
  if (error) console.error('Erreur:', error)
  return data
}

export async function sauvegarderDigest(digest) {
  const { data, error } = await supabase
    .from('digests')
    .upsert({
      date: new Date().toISOString().split('T')[0],
      nb_mails_total: digest.nbMailsTotal,
      nb_urgents: digest.nbUrgents,
      nb_traites: digest.nbTraites,
      resume_jour: digest.resumeJour,
      opportunites: digest.opportunites,
      alertes: digest.alertes
    }, { onConflict: 'date' })
  if (error) console.error('Erreur:', error)
  return data
}