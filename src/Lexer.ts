import createToken, { Token, TokenType } from "./Token";
import { performance } from "perf_hooks";

const keywords: Record<string, TokenType> = {
  "and": TokenType.AND,
  "class": TokenType.CLASS,
  "else": TokenType.ELSE,
  "false": TokenType.FALSE,
  "for": TokenType.FOR,
  "fn": TokenType.FN,
  "if": TokenType.IF,
  "nil": TokenType.NIL,
  "or": TokenType.OR,
  "print": TokenType.PRINT,
  "return": TokenType.RETURN,
  "super": TokenType.SUPER,
  "this": TokenType.THIS,
  "true": TokenType.TRUE,
  "var": TokenType.VAR,
  "while": TokenType.WHILE,
};

function isDigit(digit: string): boolean {
  // @ts-ignore
  if (isNaN(digit)) {
    return false;
  }
  var x = parseInt(digit);
  return (x | 0) === x;
}

function isAlpha(char: string): boolean {
  return (char >= "a" && char <= "z")
    || (char >= "A" && char <= "Z")
    || char === "_";
}

function isAlphaNumeric(char: string): boolean {
  return isAlpha(char) || isDigit(char);
}

function printBenchInfo(c: string): void {
  process.stdout.write(`'${c.replace("\n", "\\n")}' -> `);
}

function flattenStr(s: string): string {
  // @ts-ignore
  s | 0;
  return s;
}

const TEST_PERF = true;

class Lexer {
  public tokens: Token[] = [];
  private start = 0;
  private current = 0;
  private line = 1;

  constructor(private source: string) { }

  public async scan(): Promise<Token[]> {
    try {
      this.source = flattenStr(this.source);
      if (TEST_PERF) console.info("Performance data for token lexing below:")
      while (!this.isEnd) {
        this.start = this.current;

        if (TEST_PERF) {
          let startTime = performance.now();
          this.scanToken();
          process.stdout.write(`${(performance.now() - startTime).toFixed(2)}ms\n`);
        } else {
          this.scanToken();
        }
      }

      if (TEST_PERF) process.stdout.write("\n");

      this.tokens.push(createToken(TokenType.EOF, this.line, ""));
      return this.tokens;
    } catch (err) {
      throw err;
    }
  }


  public scanToken(): void {
    // The token that scanToken works with is actually
    // one behind the one that would be retrieved with this.source.charAt(this.current).
    // This is so that peaking future characters is easier to deal with.
    const c = this.next();
    switch (c) {
      case "(": this.addToken(TokenType.LEFT_PAREN); break;
      case ")": this.addToken(TokenType.RIGHT_PAREN); break;
      case "{": this.addToken(TokenType.LEFT_BRACE); break;
      case "}": this.addToken(TokenType.RIGHT_BRACE); break;
      case ",": this.addToken(TokenType.COMMA); break;
      case ".": this.addToken(TokenType.DOT); break;
      case "-": this.addToken(TokenType.MINUS); break;
      case "+": this.addToken(TokenType.PLUS); break;
      case ";": this.addToken(TokenType.SEMICOLON); break;
      case "*": this.addToken(TokenType.STAR); break;
      case "!": this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG); break;
      case "=": this.addToken(this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL); break;
      case "<": this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS); break;
      case ">": this.addToken(this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER); break;
      case "/":
        if (this.match("/")) {
          // A comment goes until the end of the line.
          while (this.peek() !== "\n" && !this.isEnd) this.next();
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;

      // Ignore whitespace.
      case " ":
      case "\r":
      case "\t": break;
      case "\n":
        this.line++;
        break;
      case "\"": this.string(); break;
      default:
        if (isDigit(c)) {
          this.number();
          //> identifier-start
        } else if (isAlpha(c)) {
          this.identifier();
        } else {
          throw new SyntaxError(`Unexpected character "${c}" on line: ${this.line}`);
        }
    }
    if (TEST_PERF) printBenchInfo(c);
  }

  private identifier(): void {
    while (isAlphaNumeric(this.peek())) this.next();
    // See if the identifier is a reserved word.
    const text = this.source.slice(this.start, this.current);
    let type = keywords[text];
    if (!type) type = TokenType.IDENTIFIER;
    const val = type === TokenType.TRUE
      ? true
      : type === TokenType.FALSE
        ? false
        : void 0;
    this.addToken(type, val, text);
  }

  private number() {
    while (isDigit(this.peek())) this.next();
    let isFloat = false;

    // Look for a fractional part.
    if (this.peek() === "." && isDigit(this.peekNext())) {
      // Consume the ".".
      this.next();

      isFloat = true;

      while (isDigit(this.peek())) this.next();
    }

    const resNumber = this.source.slice(this.start, this.current);
    const finalNumber = isFloat ? parseFloat(resNumber) : parseInt(resNumber);

    this.addToken(TokenType.NUMBER, finalNumber, resNumber);
  }

  private string() {
    while (this.peek() !== "\"" && !this.isEnd) {
      if (this.peek() === "\n") this.line++;
      this.next();
    }

    // Unterminated string.
    if (this.isEnd) throw new SyntaxError(`Unterminated string on line ${this.line}`);

    // The closing ".
    this.next();

    // Trim the surrounding quotes.
    const value = this.source.slice(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  private next() {
    this.current++;
    return this.source.charAt(this.current - 1);
  }

  private peek(): string {
    if (this.isEnd) return "\0";
    return this.source.charAt(this.current);
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return "\0";
    return this.source.charAt(this.current + 1);
  }

  private addToken(token: TokenType, literal?: any, slicedStr?: string): void {
    const newToken = createToken(
      token,
      this.line,
      slicedStr || this.source.slice(this.start, this.current),
      literal,
    );

    this.tokens.push(newToken);
  }

  private match(expected: string): boolean {
    if (this.isEnd || this.source.charAt(this.current) !== expected) return false;

    this.current++;
    return true;
  }

  private get isEnd(): boolean {
    return this.current >= this.source.length;
  }
}

export default Lexer;
