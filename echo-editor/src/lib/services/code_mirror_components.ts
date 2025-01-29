import { StateField, StateEffect, RangeSetBuilder } from "@codemirror/state";
import { Decoration, EditorView, WidgetType } from "@codemirror/view";

export type CodeError = {
    lineNumber: number,
    name: string,
    description: string,
}


// Define a StateEffect to update the list of name errors
const setNameErrorsEffect = StateEffect.define();

// Define the StateField to manage the decorations for name errors
const nameErrorField = StateField.define({
    create() {
        return Decoration.none;
    },
    update(decorations, transaction) {
        // Apply document changes to existing decorations
        decorations = decorations.map(transaction.changes);

        // Check for the setNameErrorsEffect in the transaction effects
        for (let effect of transaction.effects) {
            if (effect.is(setNameErrorsEffect)) {
                // Create new decorations based on the provided errors
                const builder = new RangeSetBuilder()
                const codeErrors: CodeError[] = effect.value as unknown as CodeError[] || []
                for (let codeError of codeErrors) {
                    const line = transaction.state.doc.line(codeError.lineNumber)
                    const widget = Decoration.widget({
                        widget: new NameErrorWidget(codeError.name, codeError.description),
                        side: -1, // Places the widget before the specified position
                    })
                    builder.add(line.from, line.from, widget)
                }
                decorations = builder.finish();
            }
        }
        return decorations;
    },
    provide: (field) => EditorView.decorations.from(field),
});

// WidgetType subclass for the NameError widget
class NameErrorWidget extends WidgetType {
    name: string
    description: string

    constructor(name: string, description: string) {
        super()
        this.name = name || "Error"
        this.description = description || ""
    }

    toDOM() {
        const container = document.createElement('div')
        container.className = "cm-error"

        const header = document.createElement('div')
        header.className = "cm-error-header"

        const icon = document.createElement('img')
        icon.className = "cm-error-icon"
        icon.src = `/images/editor/bug-icon.svg`

        const text = document.createElement('p')
        text.textContent = this.name
        text.className = "cm-error-text"

        const content = document.createElement('div')
        content.className = "cm-error-content"

        const description = document.createElement("p")
        description.textContent = this.description
        description.className = "cm-error-description"

        const buttonRow = document.createElement('div')
        buttonRow.className = "cm-error-button-row"

        const mainButton = document.createElement('button')
        mainButton.className = 'cm-error-main-button'
        mainButton.innerText = 'Erklären'

        const secondaryButton = document.createElement('button')
        secondaryButton.className = 'cm-error-secondary-button'
        secondaryButton.innerHTML = `<img src="/images/editor/copy-icon-white.svg" alt="Kopieren">`

        secondaryButton.addEventListener('click', () => navigator.clipboard.writeText(
            `${this.name}: ${this.description}`
        ))

        header.appendChild(icon)
        header.appendChild(text)
        content.appendChild(description)
        content.appendChild(buttonRow)
        buttonRow.appendChild(mainButton)
        buttonRow.appendChild(secondaryButton)
        container.appendChild(header)
        container.appendChild(content)
        return container
    }

    ignoreEvent() {
        return false; // Allows the widget to be interactive if needed
    }
}

// Function to update the list of name errors
export function setNameErrors(view: EditorView, errors: CodeError[]) {
    view.dispatch({
        effects: setNameErrorsEffect.of(errors),
    });
}

// Extension to include in the editor configuration
export const nameErrorExtension = [nameErrorField];