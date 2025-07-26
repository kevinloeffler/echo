
export function mapUserRoles(role: UserRoles) {
    switch (role) {
        case 'Admin':
            return 'Administrator'
        case 'Teacher':
            return 'Lehrperson'
        case 'Student':
            return 'Schüler:in'
        default:
            return role
    }
}

export function debounce(func: (...args: any[]) => void, wait: number): () => void {
    let timeout: NodeJS.Timeout
    return (...args) => {
        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(() => { func(...args) }, wait)
    }
}

export function findFirstLessonInCourse(course: Course): Optional<CourseContent> {
    for (const content of course.content) {
        const lesson = findFirstLesson(content)
        if (lesson) {
            return lesson
        }
    }
}

function findFirstLesson(courseContent: CourseContent): Optional<CourseContent> {

    if (courseContent.type === 'lesson')  return courseContent
    if (courseContent.content.length === 0)  return undefined

    for (const content of courseContent.content) {
        const lesson = findFirstLesson(content)
        if (lesson) {
            return lesson
        }
    }
}
