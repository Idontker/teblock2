import { Scanner } from "../lib/scanner/scanner";
import { Parser } from "../lib/parser/parser";
import { TokenType } from "../lib/scanner/tokens";

describe("Parser", () => {
  test("parses simple expression", () => {
    const source = "3 + 5;";
    const scanner = new Scanner(source);
    const parser = new Parser(scanner.scanTokens());
    const ast = parser.parse();

    expect(ast).toMatchObject([
      {
        type: "Expression",
        expression: {
          type: "Binary",
          left: { type: "Literal", value: 3 },
          operator: { type: TokenType.PLUS },
          right: { type: "Literal", value: 5 },
        },
      },
    ]);
  });

  test("handles precedence", () => {
    const source = "3 + 5 * 2;";
    const ast = new Parser(new Scanner(source).scanTokens()).parse();

    const firstStmt = ast[0];
    if (firstStmt.type !== "Expression") {
      throw new Error("Expected Expression statement");
    }

    expect(firstStmt.expression).toMatchObject({
      type: "Binary",
      left: { type: "Literal", value: 3 },
      operator: { type: TokenType.PLUS },
      right: {
        type: "Binary",
        left: { type: "Literal", value: 5 },
        operator: { type: TokenType.STAR },
        right: { type: "Literal", value: 2 },
      },
    });
  });

  test("parses variable declaration", () => {
    const source = "var x = 42;";
    const ast = new Parser(new Scanner(source).scanTokens()).parse();

    expect(ast[0]).toMatchObject({
      type: "Var",
      name: "x",
      initializer: { type: "Literal", value: 42 },
    });
  });

  test("errors on invalid syntax", () => {
    const source = "var = 5;";
    expect(() => new Parser(new Scanner(source).scanTokens()).parse()).toThrow(
      "Expect variable name"
    );
  });
});

describe("Tokenizer + Parser Integration", () => {
  test("full pipeline test", () => {
    const source = `
      var x = 10; 
      print x + 5;
    `;

    const scanner = new Scanner(source);
    const parser = new Parser(scanner.scanTokens());
    const ast = parser.parse();

    expect(ast).toHaveLength(2);
    expect(ast[0].type).toBe("Var");
    expect(ast[1].type).toBe("Print");
  });

  test("handles complex expression", () => {
    const source = "(a + b) * (c - d);";
    const ast = new Parser(new Scanner(source).scanTokens()).parse();

    // First verify it's an Expression statement
    const firstStmt = ast[0];
    if (firstStmt.type !== "Expression") {
      throw new Error("Expected Expression statement");
    }

    // Now safely access .expression
    expect(firstStmt.expression).toMatchObject({
      type: "Binary",
      operator: { type: TokenType.STAR },
      left: {
        type: "Grouping",
        expression: {
          type: "Binary",
          operator: { type: TokenType.PLUS },
          left: { type: "Variable", name: "a" },
          right: { type: "Variable", name: "b" },
        },
      },
      right: {
        type: "Grouping",
        expression: {
          type: "Binary",
          operator: { type: TokenType.MINUS },
          left: { type: "Variable", name: "c" },
          right: { type: "Variable", name: "d" },
        },
      },
    });
  });
});
