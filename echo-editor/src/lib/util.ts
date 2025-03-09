
export function mapUserRoles(role: UserRoles) {
    switch (role) {
        case 'Admin':
            return 'Administrator'
        case 'Teacher':
            return 'Lehrperson'
        case 'Student':
            return 'Schüler:in'
        default:
            return role
    }
}

export function debounce(func: (...args: any[]) => void, wait: number): () => void {
    let timeout: NodeJS.Timeout
    return (...args) => {
        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(() => { func(...args) }, wait)
    }
}
