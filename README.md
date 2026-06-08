# Fiszki

A browser-based flashcard app for learning Portuguese–Polish vocabulary.

## How to use

1. Open the app
2. Upload a JSON file with your vocabulary, or use the built-in sample words
3. Choose direction and difficulty
4. Practice!

## JSON format

Words are stored as JSON files with `pl` and `pt` fields:

```json
[
  { "pl": "dzień dobry", "pt": "bom dia" },
  { "pl": "dziękuję", "pt": "obrigado" }
]
```

## Planned

- Styling
- Support for other language pairs
- Progress tracking between sessions