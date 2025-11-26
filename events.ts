
const emitter = new EventTarget();

interface EventDataMap {
    'metaInput': { value: string };
}

export const emit = <K extends keyof EventDataMap>(name: K, eventData: EventDataMap[K]) => {
    emitter.dispatchEvent(new CustomEvent(name, { detail: eventData }));
}
export const listen = <K extends keyof EventDataMap>(name: K, callback: (eventData: EventDataMap[K]) => void) => {
    emitter.addEventListener(name, (event: CustomEvent<EventDataMap[K]>) => callback(event.detail));    
}
