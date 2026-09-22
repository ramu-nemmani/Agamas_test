const buttons = [
  "bold",
  "underline",
  "italic",
  "|",
  "align",
  "|",
  "ul",
  "ol",
  "outdent",
  "indent",
  "|",
  "fontsize",
  "|",
  "lineHeight",
  "find",
];

const EditorConfig = {
  readonly: false,
  toolbar: true,
  spellcheck: true,
  language: "en",
  toolbarButtonSize: "medium",
  toolbarAdaptive: false,
  showCharsCounter: false,
  showWordsCounter: false,
  showXPathInStatusbar: false,
  askBeforePasteHTML: false,
  askBeforePasteFromWord: false,
  buttons,
  uploader: {
    insertImageAsBase64URI: false,
  },
  style: {
    padding: "20px",
  },
};

export default EditorConfig;
