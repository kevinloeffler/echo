import type {PageLoad} from './$types'
import {PUBLIC_API_URL} from '$env/static/public'

export const load: PageLoad = async ({ params, fetch }) => {
    const response = await fetch(PUBLIC_API_URL + `/courses/${params.id}`)
    return await response.json()
}
