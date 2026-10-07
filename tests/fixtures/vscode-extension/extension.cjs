const { pathToFileURL } = require("node:url");
const { resolve } = require("node:path");

async function activate() {
  const parserUrl = pathToFileURL(resolve(__dirname, "../../../dist/index.js")).href;
  const { IodxParseError, parseCst } = await import(parserUrl);

  return {
    inspect(document) {
      try {
        const cst = parseCst(document.getText());
        return {
          status: "ok",
          rootType: cst.type,
          firstValue: cst.children[0]?.value,
        };
      } catch (error) {
        if (!(error instanceof IodxParseError)) throw error;
        return {
          status: "error",
          beginOffset: error.token?.getBeginOffset(),
          endOffset: error.token?.getEndOffset(),
        };
      }
    },
  };
}

module.exports = { activate };
