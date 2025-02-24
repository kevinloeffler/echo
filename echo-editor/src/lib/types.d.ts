
type Optional<T> = T | undefined;

type PythonOutput = {
    status: 'output' | 'error' | 'ready' | 'done',
    data: string,
    type?: Optional<'stdout' | 'stderr'>,
    id?: Optional<string>,
}

type UserRoles = 'Admin'| 'Teacher' | 'Student'

type User = {}

type Chapter = {}

type Lesson = {}

type Course = {
    id?: string,
    name: string,
    description: string,
    hidden: boolean,
    archived: boolean,

    students: User[],
    content: Chapter[] | Lesson[],
    teacher: User,
}

type CourseContent = {
    id: number,
    name: string,
    description: string,
    type: 'chapter' | 'lesson',
    content: CourseContent[],
}