import { Token } from "../scanner/tokens";

export type Expr =
  | Literal
  | Variable
  | Binary
  | Grouping
  | Unary
  | Assign
  | Logical;

export type Stmt = ExpressionStmt | PrintStmt | VarStmt;

export interface Literal {
  type: "Literal";
  value: any;
}

export interface Variable {
  type: "Variable";
  name: string;
}

export interface Binary {
  type: "Binary";
  left: Expr;
  operator: Token;
  right: Expr;
}

export interface Grouping {
  type: "Grouping";
  expression: Expr;
}

export interface Unary {
  type: "Unary";
  operator: Token;
  right: Expr;
}

export interface Assign {
  type: "Assign";
  name: string;
  value: Expr;
}

export interface Logical {
  type: "Logical";
  left: Expr;
  operator: Token;
  right: Expr;
}

export interface ExpressionStmt {
  type: "Expression";
  expression: Expr;
}

export interface PrintStmt {
  type: "Print";
  expression: Expr;
}

export interface VarStmt {
  type: "Var";
  name: string;
  initializer: Expr | null;
}

export class ParseError extends Error {}
