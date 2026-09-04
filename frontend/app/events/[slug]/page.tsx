import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingActions from '@/components/ui/FloatingActions'
import EventDetail from '@/components/events/EventDetail'
import { fetchEventBySlug } from '@/lib/services/storefront.service'

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let event
  try {
    event = await fetchEventBySlug(params.slug)
  } catch {
    return { title: 'Event | Soil Goddess' }
  }
  return {
    title: `${event.name} | Soil Goddess`,
    description: event.description?.slice(0, 160) ?? 'Book your Spot at this Soil Goddess event.',
  }
}

export default async function EventDetailPage({ params }: Props) {
  let event
  try {
    event = await fetchEventBySlug(params.slug)
  } catch {
    notFound()
  }

  return (
    <>
      <Header />
      <EventDetail event={event} />
      <Footer />
      <FloatingActions />
    </>
  )
}