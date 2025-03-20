import {PUBLIC_API_URL_CLIENTSIDE} from '$env/static/public'

export async function updateCourse(updatedCourse: Course) {
    const response = await fetch(`${PUBLIC_API_URL_CLIENTSIDE}/courses/${updatedCourse.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedCourse),
        credentials: 'include',
    })
    const reply = await response.json()
    return !(!response.ok || !reply.status)
}
