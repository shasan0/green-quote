export const formatDate = (iso: string) =>
    new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(iso));