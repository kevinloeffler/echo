
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
