
type Optional<T> = T | undefined;

type PythonOutput = {
    status: 'output' | 'error' | 'ready' | 'done',
    data: string,
    type?: Optional<'stdout' | 'stderr'>,
    id?: Optional<string>,
}

type UserRoles = 'Admin'| 'Teacher' | 'Student'

type User = {
    id?: string,
    name: string,
    mail: string,
    role: UserRoles,
    profilePicture: Optional<string>,
    organisation: string,
    link: Optional<string>,
    description: Optional<string>,
    archive: boolean,
}

type Chapter = {}

type Lesson = {}

type Course = {
    id?: string,
    name: string,
    description: string,
    hidden: boolean,
    archived: boolean,

    students: User[],
    content: CourseContent[],
    teacher: User,
}

type CourseContent = {
    id: number,
    name: string,
    description: string,
    type: 'chapter' | 'lesson',
    content: CourseContent[],
}