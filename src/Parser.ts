import { Token, TokenType } from "./Token";
import Expr from "./Expr";

class Parser {
  private current = 0;

  constructor(private tokens: Token[]) {}

  public async parse(): Promise<Expr> {
    try {
      return this.expression;
    } catch (error) {
      throw error;
    }
  }        

  private get expression(): Expr {
    return this.equality;
  }

  private get equality(): Expr {
    let expr = this.comparison;

    while (this.matchPattern(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous;
      const right = this.comparison;
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private get comparison(): Expr {
    let expr = this.addition;

    while (this.matchPattern(TokenType.GREATER, TokenType.GREATER_EQUAL, TokenType.LESS, TokenType.LESS_EQUAL)) {
      const operator = this.previous;
      const right = this.addition;
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }
  
  private get addition(): Expr {
    let expr = this.multiplication;

    while (this.matchPattern(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous;
      const right = this.multiplication;
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  private get multiplication(): Expr {
    let expr = this.unary;

    while (this.matchPattern(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous;
      const right = this.unary;
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  // unary → ( "!" | "-" ) unary
  //       | primary;
  private get unary(): Expr {
    if (this.matchPattern(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous;
      const right = this.unary;
      return new Expr.Unary(operator, right);
    }

    const prim = this.primary;
    return prim;
  }
  
  // @ts-ignore
  private get primary(): Expr {
    if (this.matchPattern(TokenType.FALSE)) return new Expr.Literal(false);
    if (this.matchPattern(TokenType.TRUE)) return new Expr.Literal(true);
    if (this.matchPattern(TokenType.NIL)) return new Expr.Literal(null);
    if (this.matchPattern(TokenType.NUMBER, TokenType.STRING)) {
      return new Expr.Literal(this.previous.literalValue);
    }

    if (this.matchPattern(TokenType.LEFT_PAREN)) {
      const expr = this.expression;
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
      return new Expr.Grouping(expr);
    }

  }

  private consume(type: TokenType, message: string): Token {
    if (this.typeCheck(type)) return this.next();

    throw new SyntaxError(`At '${this.peek.lexeme}' at ${this.peek.line}: ${message}`);
  }

  private matchPattern(...types: TokenType[]) {
    for (const type of types) {
      if (this.typeCheck(type)) {
        this.next();
        return true;
      }
    }

    return false;
  }

  private typeCheck(type: TokenType): boolean {
    if (this.isEnd) return false;
    return this.peek.tokenType === type;
  }

  private get isEnd() {
    return this.peek.tokenType === TokenType.EOF;
  }

  private next(): Token {
    if (!this.isEnd) this.current++;
    return this.previous;
  }

  private get peek(): Token {
    return this.tokens[this.current];
  }

  private get previous(): Token {
    return this.tokens[this.current - 1];
  }
}

export default Parser;
