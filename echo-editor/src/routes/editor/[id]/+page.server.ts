import {PUBLIC_API_URL} from '$env/static/public'

export const load = async ({ params, fetch }) => {
    const response = await fetch(PUBLIC_API_URL + `/course-content/${params.id}`)
    const courseContent = await response.json()
    const responseCourse = await fetch(PUBLIC_API_URL + `/courses/${courseContent.parent_id}`)
    const course = await responseCourse.json()
    return {course, courseContent}
}
