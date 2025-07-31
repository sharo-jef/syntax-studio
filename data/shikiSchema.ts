export const shikiJsonSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "The unique identifier for this language",
      pattern: "^[a-z][a-z0-9-]*$"
    },
    displayName: {
      type: "string",
      description: "The human-readable name for this language"
    },
    aliases: {
      type: "array",
      description: "Alternative names for this language",
      items: {
        type: "string"
      }
    },
    patterns: {
      type: "array",
      description: "Array of patterns that define the syntax highlighting rules",
      items: {
        $ref: "#/definitions/pattern"
      }
    },
    repository: {
      type: "object",
      description: "Named patterns that can be referenced by include statements",
      patternProperties: {
        "^[a-zA-Z_][a-zA-Z0-9_-]*$": {
          type: "object",
          properties: {
            patterns: {
              type: "array",
              items: {
                $ref: "#/definitions/pattern"
              }
            }
          }
        }
      }
    }
  },
  required: ["name", "patterns"],
  definitions: {
    pattern: {
      type: "object",
      oneOf: [
        {
          // Simple match pattern
          properties: {
            name: {
              type: "string",
              description: "The scope name for this pattern",
              enum: [
                "keyword.control",
                "keyword.operator",
                "keyword.other",
                "string.quoted.single",
                "string.quoted.double",
                "string.quoted.triple",
                "string.unquoted",
                "string.interpolated",
                "string.regexp",
                "comment.line.double-slash",
                "comment.line.number-sign",
                "comment.line",
                "comment.block",
                "comment.documentation",
                "constant.numeric",
                "constant.numeric.integer",
                "constant.numeric.float",
                "constant.numeric.hex",
                "constant.numeric.octal",
                "constant.numeric.binary",
                "constant.language",
                "constant.language.boolean",
                "constant.language.null",
                "constant.character",
                "constant.character.escape",
                "variable.parameter",
                "variable.language",
                "variable.other",
                "support.function",
                "support.class",
                "support.type",
                "support.constant",
                "entity.name.function",
                "entity.name.class",
                "entity.name.type",
                "entity.name.namespace",
                "entity.name.tag",
                "entity.other.attribute-name",
                "invalid.illegal",
                "invalid.deprecated",
                "storage.type",
                "storage.modifier",
                "punctuation.definition.string",
                "punctuation.definition.comment",
                "punctuation.separator",
                "punctuation.terminator",
                "punctuation.accessor",
                "meta.brace.round",
                "meta.brace.square",
                "meta.brace.curly",
                "meta.function-call",
                "meta.class",
                "meta.import",
                "meta.export"
              ]
            },
            match: {
              type: "string",
              description: "Regular expression pattern to match"
            }
          },
          required: ["match"],
          additionalProperties: false
        },
        {
          // Begin/end pattern
          properties: {
            name: {
              type: "string",
              description: "The scope name for this pattern"
            },
            begin: {
              type: "string",
              description: "Regular expression pattern that starts the match"
            },
            end: {
              type: "string",
              description: "Regular expression pattern that ends the match"
            },
            patterns: {
              type: "array",
              description: "Patterns to apply within the begin/end block",
              items: {
                $ref: "#/definitions/pattern"
              }
            },
            captures: {
              type: "object",
              description: "Named capture groups from the begin pattern",
              patternProperties: {
                "^[0-9]+$": {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      description: "Scope name for this capture group"
                    }
                  }
                }
              }
            },
            beginCaptures: {
              type: "object",
              description: "Named capture groups from the begin pattern",
              patternProperties: {
                "^[0-9]+$": {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      description: "Scope name for this capture group"
                    }
                  }
                }
              }
            },
            endCaptures: {
              type: "object",
              description: "Named capture groups from the end pattern",
              patternProperties: {
                "^[0-9]+$": {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      description: "Scope name for this capture group"
                    }
                  }
                }
              }
            }
          },
          required: ["begin", "end"],
          additionalProperties: false
        },
        {
          // Include pattern
          properties: {
            include: {
              type: "string",
              description: "Reference to another pattern",
              pattern: "^(#[a-zA-Z_][a-zA-Z0-9_-]*|\\$self|\\$base)$"
            }
          },
          required: ["include"],
          additionalProperties: false
        },
        {
          // Nested patterns
          properties: {
            name: {
              type: "string",
              description: "The scope name for this pattern"
            },
            patterns: {
              type: "array",
              description: "Array of nested patterns",
              items: {
                $ref: "#/definitions/pattern"
              }
            }
          },
          required: ["patterns"],
          additionalProperties: false
        }
      ]
    }
  }
};

export const commonRegexPatterns = [
  {
    name: "Keywords",
    pattern: "\\\\b(keyword1|keyword2|keyword3)\\\\b",
    description: "Match specific keywords"
  },
  {
    name: "String (Double Quotes)",
    pattern: '"[^"]*"',
    description: "Match double-quoted strings"
  },
  {
    name: "String (Single Quotes)",
    pattern: "'[^']*'",
    description: "Match single-quoted strings"
  },
  {
    name: "String with Escapes",
    pattern: '"(?:[^"\\\\]|\\\\.)*"',
    description: "Match strings with escape sequences"
  },
  {
    name: "Line Comment (//)",
    pattern: "//.*$",
    description: "Match single-line comments starting with //"
  },
  {
    name: "Line Comment (#)",
    pattern: "#.*$",
    description: "Match single-line comments starting with #"
  },
  {
    name: "Block Comment",
    pattern: "/\\*[\\s\\S]*?\\*/",
    description: "Match block comments /* ... */"
  },
  {
    name: "Integer",
    pattern: "\\\\b\\\\d+\\\\b",
    description: "Match integer numbers"
  },
  {
    name: "Float",
    pattern: "\\\\b\\\\d+\\.\\\\d+\\\\b",
    description: "Match floating point numbers"
  },
  {
    name: "Hex Number",
    pattern: "\\\\b0[xX][0-9a-fA-F]+\\\\b",
    description: "Match hexadecimal numbers"
  },
  {
    name: "Identifier",
    pattern: "\\\\b[a-zA-Z_][a-zA-Z0-9_]*\\\\b",
    description: "Match identifiers (variables, function names, etc.)"
  },
  {
    name: "Function Call",
    pattern: "\\\\b[a-zA-Z_][a-zA-Z0-9_]*(?=\\\\s*\\\\()",
    description: "Match function calls (identifier followed by parentheses)"
  },
  {
    name: "Operators",
    pattern: "[+\\-*/=<>!&|^%]",
    description: "Match common operators"
  },
  {
    name: "Punctuation",
    pattern: "[{}\\[\\]();,.]",
    description: "Match common punctuation marks"
  }
];

export const shikiCompletionItems = [
  {
    label: "name",
    insertText: '"name": "${1:my-language}"',
    documentation: "Unique identifier for this language (required)"
  },
  {
    label: "displayName",
    insertText: '"displayName": "${1:My Language}"',
    documentation: "Human-readable name for this language"
  },
  {
    label: "aliases",
    insertText: '"aliases": ["${1:alias1}", "${2:alias2}"]',
    documentation: "Alternative names for this language"
  },
  {
    label: "patterns",
    insertText: '"patterns": [\n\t{\n\t\t"name": "${1:keyword.control}",\n\t\t"match": "${2:\\\\\\\\b(if|else|while)\\\\\\\\b}"\n\t}\n]',
    documentation: "Array of patterns that define syntax highlighting rules (required)"
  },
  {
    label: "repository",
    insertText: '"repository": {\n\t"${1:patternName}": {\n\t\t"patterns": [\n\t\t\t{\n\t\t\t\t"name": "${2:scope.name}",\n\t\t\t\t"match": "${3:pattern}"\n\t\t\t}\n\t\t]\n\t}\n}',
    documentation: "Named patterns that can be referenced by include statements"
  },
  {
    label: "pattern-match",
    insertText: '{\n\t"name": "${1:keyword.control}",\n\t"match": "${2:\\\\\\\\b(keyword)\\\\\\\\b}"\n}',
    documentation: "Simple match pattern"
  },
  {
    label: "pattern-begin-end",
    insertText: '{\n\t"name": "${1:string.quoted.double}",\n\t"begin": "${2:\\"}",\n\t"end": "${3:\\"}",\n\t"patterns": [\n\t\t{\n\t\t\t"name": "${4:constant.character.escape}",\n\t\t\t"match": "${5:\\\\\\\\.}"\n\t\t}\n\t]\n}',
    documentation: "Begin/end pattern for multi-line constructs"
  },
  {
    label: "pattern-include",
    insertText: '{\n\t"include": "${1:#patternName}"\n}',
    documentation: "Include reference to another pattern"
  },
  {
    label: "keyword-pattern",
    insertText: '{\n\t"name": "keyword.control",\n\t"match": "\\\\\\\\b(${1:if|else|while|for|function|return})\\\\\\\\b"\n}',
    documentation: "Pattern for matching keywords"
  },
  {
    label: "string-pattern",
    insertText: '{\n\t"name": "string.quoted.double",\n\t"begin": "\\"",\n\t"end": "\\"",\n\t"patterns": [\n\t\t{\n\t\t\t"name": "constant.character.escape",\n\t\t\t"match": "\\\\\\\\\\\\\\\\.",\n\t\t\t"comment": "Escaped characters"\n\t\t}\n\t]\n}',
    documentation: "Pattern for matching quoted strings with escape sequences"
  },
  {
    label: "comment-line-pattern",
    insertText: '{\n\t"name": "comment.line.double-slash",\n\t"match": "//${1:.*$}"\n}',
    documentation: "Pattern for single-line comments"
  },
  {
    label: "comment-block-pattern",
    insertText: '{\n\t"name": "comment.block",\n\t"begin": "/\\\\*",\n\t"end": "\\\\*/",\n\t"patterns": [\n\t\t{\n\t\t\t"name": "comment.block.documentation",\n\t\t\t"match": "\\\\*.*$"\n\t\t}\n\t]\n}',
    documentation: "Pattern for block comments"
  },
  {
    label: "number-pattern",
    insertText: '{\n\t"name": "constant.numeric",\n\t"match": "\\\\\\\\b\\\\\\\\d+(\\\\\\\\.\\\\\\\\d+)?\\\\\\\\b"\n}',
    documentation: "Pattern for numeric literals (integers and floats)"
  },
  {
    label: "identifier-pattern",
    insertText: '{\n\t"name": "variable.other",\n\t"match": "\\\\\\\\b[a-zA-Z_][a-zA-Z0-9_]*\\\\\\\\b"\n}',
    documentation: "Pattern for identifiers (variables, function names)"
  },
  {
    label: "function-call-pattern",
    insertText: '{\n\t"name": "entity.name.function",\n\t"match": "\\\\\\\\b[a-zA-Z_][a-zA-Z0-9_]*(?=\\\\\\\\s*\\\\\\\\()"\n}',
    documentation: "Pattern for function calls"
  },
  {
    label: "operator-pattern",
    insertText: '{\n\t"name": "keyword.operator",\n\t"match": "[${1:+\\\\-*/=<>!&|^%}]"\n}',
    documentation: "Pattern for operators"
  }
];
