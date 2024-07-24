<template>
  <div>
    <el-tiptap
      v-model="content"
      :extensions="extensions"
      lang="zh"
      :charCounterCount="false"
    />
  </div>
</template>

<script>
// import {
//   // necessary extensions
//   Doc,
//   Text,
//   Paragraph,
//   Heading,
//   Bold,
//   Underline,
//   Italic,
//   Strike,
//   ListItem,
//   BulletList,
//   OrderedList,
// } from "element-tiptap";
import { ElementTiptap } from "element-tiptap";
import {
  Doc,
  Text,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Strike,
  Underline,
  Link,
  Image,
  Iframe,
  CodeBlock,
  Blockquote,
  ListItem,
  BulletList,
  OrderedList,
  TodoItem,
  TodoList,
  TextAlign,
  Indent,
  LineHeight,
  HorizontalRule,
  HardBreak,
  TrailingNode,
  History,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  FormatClear,
  TextColor,
  TextHighlight,
  Preview,
  Print,
  Fullscreen,
  SelectAll,
  FontType,
  FontSize,
  CodeView,
} from "element-tiptap";

import codemirror from "codemirror";
import "codemirror/lib/codemirror.css"; // import base style
import "codemirror/mode/xml/xml.js"; // language
import "element-tiptap/lib/index.css";

export default {
  components: {
    "el-tiptap": ElementTiptap,
  },
  props: {
    value: {
      type: String,
      default: "",
    },
  },
  watch: {
    value(value) {
      // HTML
      const isSame = this.content === value;
      if (isSame) {
        return;
      }
      this.content = value;
    },
    content(value) {
      const isSame = this.value === value;
      if (isSame) {
        return;
      }
      this.$emit("input", value);
    },
  },

  data() {
    // editor extensions
    // they will be added to menubar and bubble menu by the order you declare.
    return {
      extensions: [
        // --- simple ---
        // new Doc(),
        // new Text(),
        // new Paragraph(),
        // new Heading({ level: 5 }),
        // new Bold({ bubble: true }), // render command-button in bubble menu.
        // new Underline({ bubble: true, menubar: false }), // render command-button in bubble menu but not in menubar.
        // new Italic(),
        // new Strike(),
        // new ListItem(),
        // new BulletList(),
        // new OrderedList(),

        //---- pro ---
        new Doc(),
        new Text(),
        new Paragraph(),
        new Heading({ level: 5 }),
        new Bold({ bubble: true }),
        new Italic(),
        new Strike(),
        new Underline({ bubble: true, menubar: false }),
        new Link(),
        new Image(),
        new Iframe(),
        new CodeBlock(),
        new Blockquote(),
        new ListItem(),
        new BulletList(),
        new OrderedList(),
        new TodoItem(),
        new TodoList(),
        new TextAlign(),
        new Indent(),
        new LineHeight(),
        new HorizontalRule(),
        new HardBreak(),
        new TrailingNode(),
        new History(),
        new Table(),
        new TableHeader(),
        new TableCell(),
        new TableRow(),
        new FormatClear(),
        new TextColor(),
        new TextHighlight(),
        new Preview(),
        // new Print(),
        new Fullscreen(),
        // new SelectAll(),
        new FontType(),
        new FontSize(),
        new CodeView({
          codemirror,
        }),
      ],
      content: "",
    };
  },
};
</script>
