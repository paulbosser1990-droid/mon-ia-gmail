import { NextResponse } from 'next/server'
import { envoyerReponse } from '@/lib/gmail'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { accessToken, emailId, reponse, expediteur, sujet } = await request.json()
    await envoyerReponse(accessToken, emailId, reponse, expediteur, sujet)
    await supabase
      .from('emails')
      .update({ repondu: true })
      .eq('gmail_id', emailId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}