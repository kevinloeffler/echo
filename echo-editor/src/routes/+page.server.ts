import {PUBLIC_API_URL} from '$env/static/public'
import {redirect} from '@sveltejs/kit'

export async function load({ fetch }) {
    const response = await fetch(`${PUBLIC_API_URL}/profile`, {
        method: 'GET',
        credentials: 'include',
    })

    if (response.status === 401) {
        throw redirect(307, '/login')
    }

    const user = await response.json()

    // load courses
    const coursesResponse = await fetch(`${PUBLIC_API_URL}/courses`, {
        method: 'GET',
        credentials: 'include',
    })
    const courses = await coursesResponse.json()
    console.log('courses:', courses)

    // load projects
    // TODO: implement
    const projects: any[] = []

    return {user, courses, projects}
}
