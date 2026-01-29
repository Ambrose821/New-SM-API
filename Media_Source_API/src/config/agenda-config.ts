import { Agenda } from 'agenda'

// Avoid reading env at import-time; initialize after dotenv.config has run in index.ts
let agendaInstance: Agenda | null = null

export const connectAgenda = async () => {
    const address = process.env.MONGO_URI
    if (!address) {
        throw new Error('[Agenda] MONGO_URI is undefined. Set it in .env before starting Agenda.')
    }

    agendaInstance = new Agenda({
        db: {
            address,
            collection: 'jobs',
        },
    })
    agendaInstance.processEvery('1 second')
    await agendaInstance.start()
    console.log('[Agenda] started and processing every 1 second')
}

export const getAgenda = (): Agenda => {
    if (!agendaInstance) {
        throw new Error('[Agenda] Agenda not initialized. Call connectAgenda() first.')
    }
    return agendaInstance
}



