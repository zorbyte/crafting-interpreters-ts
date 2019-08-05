import Expr, { Visitor } from "./Expr";
import { debugPrint } from "./debug";

const debug = debugPrint.bind(null, false);

class AstTreePrinter extends Visitor {
  constructor(private expr: Expr) {
    super();
  }

  public print() {
    return this.expr.accept(this);
  }

  public visitBinaryExpr(expr: InstanceType<typeof Expr.Binary>): string {
    debug("Visited by Binary Expr");
    return this.parenthesise(expr.operator.lexeme, expr.left, expr.right);
  }

  public visitGroupingExpr(expr: InstanceType<typeof Expr.Grouping>): string {
    debug("Visited by Grouping Expr");
    return this.parenthesise("group", expr.expr);
  }

  public visitLiteralExpr(expr: InstanceType<typeof Expr.Literal>): string {
    debug("Visited by literal Expr");
    if (expr.value === void 0) return "nil";
    return expr.value.toString();
  }

  public visitUnaryExpr(expr: InstanceType<typeof Expr.Unary>): string {
    debug("Visited by unary Expr");
    return this.parenthesise(expr.operator.lexeme, expr.right);
  }

  private parenthesise(name: string, ...exprs: Expr[]) {
    const expressionData = exprs.map(expr => expr.accept(this)).join(" ");
    return `(${name}${expressionData})`;
  }
}

export default AstTreePrinter;
