import {PUBLIC_API_URL} from '$env/static/public'
import { redirect } from '@sveltejs/kit'

export const load = async ({ params, fetch }) => {

    // Handle courses without lessons
    if (params.id === '-1') {
        redirect(307, '/')
    }

    const response = await fetch(PUBLIC_API_URL + `/course-content/${params.id}`)
    const courseContent = await response.json()
    const responseCourse = await fetch(PUBLIC_API_URL + `/courses/${courseContent.parent_id}`)
    const course = await responseCourse.json()
    return {course, courseContent}
}
