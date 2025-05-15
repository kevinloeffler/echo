import {PUBLIC_API_URL} from '$env/static/public'
import {redirect} from '@sveltejs/kit'

export async function load({ params, fetch }) {

    console.log('reloading data')

    const response = await fetch(`${PUBLIC_API_URL}/courses/${params.id}`, {
        method: 'GET',
        credentials: 'include',
    })

    if (response.status === 401) {
        throw redirect(300, '/login')
    }

    const course = await response.json()

    const responseStudents = await fetch(`${PUBLIC_API_URL}/courses/${params.id}/users`, {
        method: 'GET',
        credentials: 'include',
    })

    const courseStudents = await responseStudents.json()

    return { ...course, students: courseStudents }
}
