import { Scanner } from "../lib/scanner/scanner";
import { TokenType } from "../lib/scanner/tokens";

test("scans simple expression", () => {
  const source = `var x = 5;`;
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();

  expect(tokens.map((t) => t.type)).toEqual([
    TokenType.VAR,
    TokenType.IDENTIFIER,
    TokenType.EQUAL,
    TokenType.NUMBER,
    TokenType.SEMICOLON,
    TokenType.EOF,
  ]);
});

test("handles string literals", () => {
  const source = `"hello world"`;
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();

  expect(tokens[0]).toMatchObject({
    type: TokenType.STRING,
    lexeme: '"hello world"',
    literal: "hello world",
  });
});

test("handles block comments", () => {
  const source = `/* comment */ 42`;
  const scanner = new Scanner(source);
  const tokens = scanner.scanTokens();

  expect(tokens).toContainEqual(
    expect.objectContaining({ type: TokenType.NUMBER, literal: 42 })
  );
});
