import { renderToStream } from "@builder.io/qwik/server";
import Root from "./root";

export default function render() {
  return renderToStream(<Root />, {
    containerTagName: "html",
    stream: undefined, // ❗ Quita `true` y usa `undefined` si no usas streaming
  });
}
