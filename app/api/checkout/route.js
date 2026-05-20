import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const { email } = await request.json()
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'MailAgent - Abonnement mensuel',
            description: 'Gestion intelligente de vos emails par IA'
          },
          unit_amount: 2900,
          recurring: { interval: 'month' }
        },
        quantity: 1
      }],
      mode: 'subscription',
      customer_email: email || undefined,
      success_url: process.env.NEXTAUTH_URL + '/?paiement=succes',
      cancel_url: process.env.NEXTAUTH_URL + '/?paiement=annule'
    })
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}