// Entrypoint aparte: "adje-shared-ui/rich-text". Fuera del barrel principal
// porque depende de Tiptap y DOMPurify (peerDependencies opcionales): solo las
// apps que usan texto enriquecido las instalan.
export { RichTextEditor, RichText, sanitizeRichText, richTextToPlain, isRichTextEmpty } from "./src/forms/RichText";
