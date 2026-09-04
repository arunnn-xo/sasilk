const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatEventDateTime(eventDate: string, startTime: string): string {
  let dateText = eventDate
  try {
    const [y, m, d] = eventDate.split('-').map(Number)
    const date = new Date(y, (m ?? 1) - 1, d ?? 1)
    dateText = `${DAYS[date.getDay()]}, ${String(d).padStart(2, '0')} ${MONTHS[(m ?? 1) - 1]} ${y}`
  } catch {
    /* keep raw */
  }
  return `${dateText} · ${formatTime12h(startTime)}`
}

export function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const hour = (h ?? 0) % 12 || 12
  const suffix = (h ?? 0) >= 12 ? 'PM' : 'AM'
  return `${hour}:${String(m ?? 0).padStart(2, '0')} ${suffix}`
}

export function formatDateLong(date: Date): string {
  return `${DAYS[date.getDay()]}, ${String(date.getDate()).padStart(2, '0')} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}