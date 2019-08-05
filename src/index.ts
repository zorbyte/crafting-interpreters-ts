import { performance } from "perf_hooks";
import Lexer from "./Lexer";
import Parser from "./Parser";
import AstTreePrinter from "./AstTreePrinter";

const PRINT_DATA = true;

const SAMPLE_CODE = `
11 * (1.1 / 4) + 2
`;

console.debug("Sample code is as follows:\n", SAMPLE_CODE);
async function run(): Promise <void> {
  try {
    // Performance measurement.
    const start = performance.now();

    // Source scanner.
    const lexer = new Lexer(SAMPLE_CODE);
    const tokens = await lexer.scan();

    const parser = new Parser(tokens);
    const treeExpr = await parser.parse();

    const finishTime = performance.now();

    if (PRINT_DATA) {
      console.debug(tokens);
      console.info(`AST Representation: ${new AstTreePrinter(treeExpr).print()}`);
    }
    console.info(`Successfully parsed all tokens and built Abstract Syntax Tree. Took ${(finishTime - start)}ms.`);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
