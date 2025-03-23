import { Token, TokenType } from "./tokens";

export class Scanner {
  private source: string;
  private tokens: Token[] = [];
  private start = 0;
  private current = 0;
  private line = 1;

  constructor(source: string) {
    this.source = source;
  }

  scanTokens(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push({
      type: TokenType.EOF,
      lexeme: "",
      literal: null,
      line: this.line,
    });
    return this.tokens;
  }

  private scanToken() {
    const c = this.advance();
    switch (c) {
      case "(":
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ")":
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case "{":
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case "}":
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case ",":
        this.addToken(TokenType.COMMA);
        break;
      case ".":
        this.addToken(TokenType.DOT);
        break;
      case "-":
        this.addToken(TokenType.MINUS);
        break;
      case "+":
        this.addToken(TokenType.PLUS);
        break;
      case ";":
        this.addToken(TokenType.SEMICOLON);
        break;
      case "*":
        this.addToken(TokenType.STAR);
        break;
      case "!":
        this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case "=":
        this.addToken(
          this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL
        );
        break;
      case "<":
        this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case ">":
        this.addToken(
          this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER
        );
        break;
      case "/":
        if (this.match("/")) {
          while (this.peek() !== "\n" && !this.isAtEnd()) this.advance();
        } else if (this.match("*")) {
          this.blockComment();
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      case " ":
      case "\r":
      case "\t":
        break;
      case "\n":
        this.line++;
        break;
      case '"':
        this.string();
        break;
      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          throw new Error(`Unexpected character ${c} at line ${this.line}`);
        }
    }
  }

  private blockComment() {
    while (
      !(this.peek() === "*" && this.peekNext() === "/") &&
      !this.isAtEnd()
    ) {
      if (this.peek() === "\n") this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      throw new Error("Unterminated block comment");
    }

    this.advance(); // Consume *
    this.advance(); // Consume /
  }

  private string() {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === "\n") this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      throw new Error("Unterminated string");
    }

    this.advance(); // Closing "
    const value = this.source.slice(this.start + 1, this.current - 1);
    this.addToken(TokenType.STRING, value);
  }

  private number() {
    while (this.isDigit(this.peek())) this.advance();

    // Look for decimal part
    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      this.advance();
      while (this.isDigit(this.peek())) this.advance();
    }

    this.addToken(
      TokenType.NUMBER,
      parseFloat(this.source.slice(this.start, this.current))
    );
  }

  private identifier() {
    while (this.isAlphaNumeric(this.peek())) this.advance();

    const text = this.source.slice(this.start, this.current);
    let type = keywords.get(text) || TokenType.IDENTIFIER;
    this.addToken(type);
  }

  private match(expected: string): boolean {
    if (this.isAtEnd()) return false;
    if (this.source[this.current] !== expected) return false;

    this.current++;
    return true;
  }

  private peek(): string {
    return this.isAtEnd() ? "\0" : this.source[this.current];
  }

  private peekNext(): string {
    return this.current + 1 >= this.source.length
      ? "\0"
      : this.source[this.current + 1];
  }

  private isAlpha(c: string): boolean {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c);
  }

  private isDigit(c: string): boolean {
    return c >= "0" && c <= "9";
  }

  private advance(): string {
    return this.source[this.current++];
  }

  private addToken(type: TokenType, literal: any = null) {
    const text = this.source.slice(this.start, this.current);
    this.tokens.push({ type, lexeme: text, literal, line: this.line });
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }
}

// Keywords map
const keywords = new Map<string, TokenType>([
  ["and", TokenType.AND],
  ["class", TokenType.CLASS],
  ["else", TokenType.ELSE],
  ["false", TokenType.FALSE],
  ["fun", TokenType.FUN],
  ["for", TokenType.FOR],
  ["if", TokenType.IF],
  ["null", TokenType.NULL],
  ["or", TokenType.OR],
  ["print", TokenType.PRINT],
  ["return", TokenType.RETURN],
  ["super", TokenType.SUPER],
  ["this", TokenType.THIS],
  ["true", TokenType.TRUE],
  ["var", TokenType.VAR],
  ["while", TokenType.WHILE],
]);
