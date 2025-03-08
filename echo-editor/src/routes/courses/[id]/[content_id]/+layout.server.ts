import {goto} from '$app/navigation'
import {PUBLIC_API_URL} from '$env/static/public'

export async function load({ params, cookies, fetch }) {
    const jwt = cookies.get('Token')
    console.log('jwt:', jwt)

    const headers = new Headers()
    if (jwt) {
        headers.append('Authorization', `Bearer ${jwt}`)
    }

    const response = await fetch(`${PUBLIC_API_URL}/courses/${params.id}`, {
        method: 'GET',
        headers: headers,
        credentials: 'include',
    })
    console.log('response:', response)

    if (response.status === 401) {
        await goto('/login')
    }

    const course = await response.json()
    console.log('course:', course)

    return { id: params.id, contentId: params.content_id, course }
}
