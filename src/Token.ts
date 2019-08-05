import { inspect } from "util";

export enum TokenType {
  // Single-character tokens.                      
  LEFT_PAREN, RIGHT_PAREN, LEFT_BRACE, RIGHT_BRACE,
  COMMA, DOT, MINUS, PLUS, SEMICOLON, SLASH, STAR,

  // One or two character tokens.                  
  BANG, BANG_EQUAL,
  EQUAL, EQUAL_EQUAL,
  GREATER, GREATER_EQUAL,
  LESS, LESS_EQUAL,

  // Literals.                                     
  IDENTIFIER, STRING, NUMBER,

  // Keywords.                                     
  AND, CLASS, ELSE, FALSE, FN, FOR, IF, NIL, OR,
  PRINT, RETURN, SUPER, THIS, TRUE, VAR, WHILE,

  EOF,
}

export interface Token {
  tokenType: TokenType,
  line: number,
  lexeme: string,
  literalValue?: any,
  [inspect.custom](): string,
  toString(): string,
};

function createToken(
  tokenType: TokenType,
  line: number,
  lexeme: string,
  literalValue?: any,
): Token {
  return {
    tokenType,
    line,
    lexeme,
    literalValue,

    [inspect.custom]() {
      return `Token [${this.toString()}]`
    },

    toString() {
      return `code = ${this.tokenType}, lexeme = '${this.lexeme}', value = ${this.literalValue}`;
    },
  }
}

export default createToken;
