import {redirect} from '@sveltejs/kit'

export async function load({ parent }) {
    const course = await parent()
    redirect(300, `/courses/${course.id}/${course.contentId}/task`)
}
