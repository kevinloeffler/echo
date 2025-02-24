type Optional<T> = T | undefined

type User = {
    id: string,
    name: string,
    mail: string,
    password: string,
    role: UserRole,
    profilePicture: Optional<string>,
    organisation: Optional<string>,
    link: Optional<string>,
    description: Optional<string>,
    archive: boolean,
}

type Course = {
    id?: string,
    name: string,
    description: string,
    hidden: boolean,
    archived: boolean,

    students: User[],
    content: ChapterOrLesson[],
    teacher: User,
}

type ChapterOrLesson = Chapter | Lesson

type Chapter = {}

type Lesson = {}
