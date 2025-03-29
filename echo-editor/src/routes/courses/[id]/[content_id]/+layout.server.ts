import {goto} from '$app/navigation'
import {PUBLIC_API_URL} from '$env/static/public'

export async function load({ params, cookies, fetch }) {
    const jwt = cookies.get('Token')

    console.log('params:', params)

    const headers = new Headers()
    if (jwt) {
        headers.append('Authorization', `Bearer ${jwt}`)
    }

    console.log('getting cc with id:', params.content_id)
    const response = await fetch(`${PUBLIC_API_URL}/course-content/${params.content_id}`, {
        method: 'GET',
        headers: headers,
        credentials: 'include',
    })

    if (response.status === 401) {
        await goto('/login')
    }

    const courseContent = await response.json()
    console.log('id:', params.id, 'contentId:', params.content_id, courseContent)

    return { id: params.id, contentId: params.content_id, courseContent }
}
