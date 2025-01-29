
type Shortcut = { shortcut: Shortcuts, action: (event: KeyboardEvent) => void }

export function handleShortcuts(node: HTMLElement, shortcuts: Shortcut[]) {

    // Option + R
    function handleOptionR(event: KeyboardEvent, callback: (event: KeyboardEvent) => void) {
        if (event.altKey && event.code === 'KeyR') {
            event.preventDefault()
            callback(event)
        }
    }

    // Escape
    function handleEscape(event: KeyboardEvent, callback: (event: KeyboardEvent) => void) {
        if (event.key === 'Escape') {
            event.preventDefault()
            callback(event)
        }
    }

    // Add listeners
    const cmd_r_action = shortcuts.find( s => s.shortcut === Shortcuts.opt_r )?.action
    if (cmd_r_action) {
        node.addEventListener('keydown', (e) => {handleOptionR(e, cmd_r_action)})
    }

    const escape = shortcuts.find( s => s.shortcut === Shortcuts.esc )?.action
    if (escape) {
        node.addEventListener('keydown', (e) => {handleEscape(e, escape)})
    }
}

export enum Shortcuts {
    opt_r,
    esc,
}
