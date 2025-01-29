
type Optional<T> = T | undefined;

type PythonOutput = {
    status: 'output' | 'error' | 'ready' | 'done',
    data: string,
    type?: Optional<'stdout' | 'stderr'>,
    id?: Optional<string>,
}

type UserRoles = 'Admin'| 'Teacher' | 'Student'
