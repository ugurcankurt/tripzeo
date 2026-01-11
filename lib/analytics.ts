import { sendGAEvent } from '@next/third-parties/google'

type EventName =
    | 'login'
    | 'sign_up'
    | 'search'
    | 'begin_checkout'
    | 'purchase'
    | 'view_item'
    | 'select_item'
    | 'generate_lead'

type EventParams = {
    [key: string]: string | number | boolean | undefined | object[]
}

export function sendEvent(eventName: EventName | string, params?: EventParams) {
    if (typeof window !== 'undefined') {
        sendGAEvent('event', eventName, params || {})
    }
}
