// Separate entrypoint: "adje-shared-ui/rich-text". Kept out of the main barrel
// because it depends on Tiptap and DOMPurify (optional peerDependencies): only
// the apps that use rich text install them.
export { RichTextEditor, RichText, sanitizeRichText, richTextToPlain, isRichTextEmpty, TEXT_TOOLS } from "./src/forms/RichText";
export type { TextTool } from "./src/forms/RichText";
