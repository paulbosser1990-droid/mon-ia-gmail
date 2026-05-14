import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

export async function analyserEmail(email) {
  const prompt = `Tu es un assistant pour commercant. Analyse cet email et reponds en JSON uniquement sans markdown.
EMAIL:
De: ${email.expediteur}
Sujet: ${email.sujet}
Contenu: ${email.contenu}
JSON attendu:
{"priorite":"urgent ou important ou normal ou spam","categorie":"commande ou reclamation ou fournisseur ou question ou autre","resume":"resume en 1 phrase","tache":"action a faire ou null","deadline":"date YYYY-MM-DD ou null","reponseSuggeree":"reponse complete et professionnelle"}`

  const result = await model.generateContent(prompt)
  const texte = result.response.text().trim()
  try {
    return JSON.parse(texte)
  } catch (e) {
    const clean = texte.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(clean)
  }
}

export async function genererDigest(emails) {
  const resumeEmails = emails.map(e => `- [${e.priorite}] ${e.sujet}: ${e.resume}`).join('\n')
  const prompt = `Tu es un assistant pour commercant. Génère un diagnostic quotidien en JSON uniquement sans markdown.
EMAILS: ${resumeEmails}
JSON: {"resumeJour":"resume en 3 phrases","opportunites":"opportunites detectees","alertes":"alertes importantes"}`

  const result = await model.generateContent(prompt)
  const texte = result.response.text().trim()
  try {
    return JSON.parse(texte)
  } catch (e) {
    const clean = texte.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(clean)
  }
}