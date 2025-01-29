import { PUBLIC_API_URL } from '$env/static/public'


type Message = {
    role: 'Assistant' | 'User',
    message: string,
}

type ApiMessageEvent = {
    type: string,
    index: string,
    delta: {type: string, text: string},
}


export class AssistantService {

    chat: Message[] = $state([])

    private async sendMessage(message: string): Promise<void> {
        const response = await fetch(`${PUBLIC_API_URL}/assistant`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: message }],
                model: 'claude-3-5-haiku-latest',
                max_tokens: 1024,
            }),
        })

        this.chat.push({
            role: 'Assistant',
            message: '',
        })

        const reader = response.body?.getReader()
        if (!reader) {
            this.chat[this.chat.length - 1].message = '...'
            return
        }

        const decoder = new TextDecoder()

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const fragment = decoder.decode(value, { stream: true })
            const splitFragments = fragment.split(/(?<=})\s*(?=\{)/)
            for (let fragment of splitFragments) {
                const jsonFragment = JSON.parse(fragment)
                this.chat[this.chat.length - 1].message += this.handleMessageEvent(jsonFragment)
            }
        }
    }

    private handleMessageEvent(messageEvent: ApiMessageEvent): string {
        if (messageEvent.type === 'content_block_delta' && messageEvent.delta.type === 'text_delta') {
            return messageEvent.delta.text
        }
        return ''
    }

    async askAssistant(question: string) {
        this.chat.push({
            role: 'User',
            message: question,
        })

        await this.sendMessage(question)
    }

    askForHelp() {
        // TODO
    }

    explainCode() {
        // TODO
    }

}

