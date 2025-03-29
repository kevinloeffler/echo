import {PUBLIC_API_URL_CLIENTSIDE} from '$env/static/public'

export async function updateCourse(updatedCourse: Course) {
    const response = await fetch(`${PUBLIC_API_URL_CLIENTSIDE}/courses/${updatedCourse.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedCourse),
        credentials: 'include',
    })
    const reply = await response.json()
    return !(!response.ok || !response.status)
}

export async function updateCourseContent(updatedCourseContent: CourseContent) {
    const response = await fetch(`${PUBLIC_API_URL_CLIENTSIDE}/course-content/${updatedCourseContent.id}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedCourseContent),
        credentials: 'include',
    })
    console.log('response:', response)
    const reply = await response.json()
    console.log('reply:', reply)
    return !(!response.ok || !reply.status)
}
