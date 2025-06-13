import { writable } from "svelte/store";

function createAlert() {
    const {subscribe, update} = writable([])

    let timeOutId = []
    const autoHide = (id) => {
        timeOutId[id] = setTimeout(() => {
            update((alerts) => (
                alerts.filter(alert => alert.id !== id)
            ))
        }, 5000)
    }

    return {
        subscribe,
        show: (message, type = 'success') => {
            const newAlert = {
                id: crypto.randomUUID(),
                message: message,
                type: type
            }
            update((last) => (
                [newAlert, ...last]
            ))
            autoHide(newAlert.id)
        },
        pauseHide: (id) => {
            clearTimeout(timeOutId[id])
        },
        resumeHide: (id) => {
            autoHide(id)
        },
        hide: (id) => {
            update((alerts) => (
                alerts.filter(alert => alert.id !== id)
            ))
            clearTimeout(timeOutId[id])
        }
    }
}

export const alertStore = createAlert()
