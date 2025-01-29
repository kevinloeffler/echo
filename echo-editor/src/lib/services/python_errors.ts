import type {CodeError} from '$lib/services/code_mirror_components'

export function parseError(errorMessage: string): CodeError {
    const lines = errorMessage.split("\n")
    const startIndex = lines.findIndex(line => line.includes('File "<exec>"'))
    const results = startIndex !== -1 ? lines.slice(startIndex) : []
    const filteredResults = results.filter( result => !!result )

    const errorLines = filteredResults.filter(str => /error/i.test(str))

    const lineNumbers = filteredResults
        .map(line => {
            const match = line.match(/line (\d+)/)
            return match ? parseInt(match[1]) : null
        })
        .filter(line => line !== null)

    const errorType = errorLines.join('\n').match(/(\w+Error): (.+)/)

    return {
        lineNumber: lineNumbers[lineNumbers.length - 1] || 0,
        name: errorType?.[1] || 'Error',
        description: errorLines.join('\n') || '',
    }
}

export function prettyError(error: CodeError): string {
    return `${error.name} at line ${error.lineNumber}\n${error.description}`
}
