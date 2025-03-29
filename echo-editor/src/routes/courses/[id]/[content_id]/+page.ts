import {redirect} from '@sveltejs/kit'

export async function load({ parent }) {
    const data = await parent()
    redirect(300, `/courses/${data.id}/${data.contentId}/task`)
}
