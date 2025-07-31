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
        },
        begin: {
          type: "string",
          description: "Regular expression pattern that starts the match"
        },
        end: {
          type: "string",
          description: "Regular expression pattern that ends the match"
        },
        while: {
          type: "string",
          description: "Continue matching while this pattern matches"
        },
        include: {
          type: "string",
          description: "Reference to another pattern",
          pattern: "^(#[a-zA-Z_][a-zA-Z0-9_-]*|\\$self|\\$base|source\\.[a-z][a-z0-9\\.-]*)$"
        },
        patterns: {
          type: "array",
          description: "Array of nested patterns",
          items: {
            $ref: "#/definitions/pattern"
          }
        },
        captures: {
          type: "object",
          description: "Named capture groups from the match pattern",
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
        },
        whileCaptures: {
          type: "object",
          description: "Named capture groups from the while pattern",
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
        contentName: {
          type: "string",
          description: "Scope name for the content between begin/end or begin/while"
        },
        comment: {
          type: "string",
          description: "Human-readable description of this pattern"
        }
      },
      anyOf: [
        {
          // Simple match pattern
          required: ["match"]
        },
        {
          // Begin/end pattern
          required: ["begin", "end"]
        },
        {
          // Begin/while pattern
          required: ["begin", "while"]
        },
        {
          // Include pattern
          required: ["include"]
        },
        {
          // Nested patterns
          required: ["patterns"]
        }
      ],
      not: {
        anyOf: [
          {
            // Cannot have both match and begin
            allOf: [
              { required: ["match"] },
              { required: ["begin"] }
            ]
          },
          {
            // Cannot have both match and include
            allOf: [
              { required: ["match"] },
              { required: ["include"] }
            ]
          },
          {
            // Cannot have both include and begin
            allOf: [
              { required: ["include"] },
              { required: ["begin"] }
            ]
          },
          {
            // Cannot have both include and patterns (at root level)
            allOf: [
              { required: ["include"] },
              { required: ["patterns"] }
            ]
          },
          {
            // Cannot have both end and while
            allOf: [
              { required: ["end"] },
              { required: ["while"] }
            ]
          }
        ]
      }
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
    insertText: '"name": "${1:scope.name}"',
    documentation: "Scope name for this pattern",
    kind: "Property"
  },
  {
    label: "displayName", 
    insertText: '"displayName": "${1:My Language}"',
    documentation: "Human-readable name for this language",
    kind: "Property"
  },
  {
    label: "patterns",
    insertText: '"patterns": []',
    documentation: "Array of patterns that define syntax highlighting rules",
    kind: "Property"
  },
  {
    label: "repository",
    insertText: '"repository": {}',
    documentation: "Named patterns that can be referenced by include statements",
    kind: "Property"
  },
  {
    label: "match",
    insertText: '"match": "${1:regex}"',
    documentation: "Regular expression pattern to match",
    kind: "Property"
  },
  {
    label: "begin",
    insertText: '"begin": "${1:start-regex}"',
    documentation: "Start pattern for begin/end blocks",
    kind: "Property"
  },
  {
    label: "end",
    insertText: '"end": "${1:end-regex}"',
    documentation: "End pattern for begin/end blocks",
    kind: "Property"
  },
  {
    label: "include",
    insertText: '"include": "${1:#patternName}"',
    documentation: "Reference to another pattern",
    kind: "Property"
  },
  {
    label: "captures",
    insertText: '"captures": {}',
    documentation: "Capture groups for match pattern",
    kind: "Property"
  },
  {
    label: "beginCaptures",
    insertText: '"beginCaptures": {}',
    documentation: "Capture groups for begin pattern",
    kind: "Property"
  },
  {
    label: "endCaptures",
    insertText: '"endCaptures": {}',
    documentation: "Capture groups for end pattern",
    kind: "Property"
  },
  {
    label: "while",
    insertText: '"while": "${1:continue-regex}"',
    documentation: "Continue matching while pattern matches",
    kind: "Property"
  },
  {
    label: "contentName",
    insertText: '"contentName": "${1:scope.name}"',
    documentation: "Scope name for content between begin/end",
    kind: "Property"
  },
  {
    label: "comment",
    insertText: '"comment": "${1:description}"',
    documentation: "Human-readable description",
    kind: "Property"
  }
];

export const commonIncludePatterns = [
  {
    pattern: '$self',
    description: 'Include the entire grammar recursively',
    usage: 'Use within nested patterns to allow recursive language constructs'
  },
  {
    pattern: '$base',
    description: 'Include the base language scope',
    usage: 'Useful for embedded languages or extending existing grammars'
  },
  {
    pattern: '#repository-name',
    description: 'Reference a named pattern from the repository',
    usage: 'Include a specific pattern defined in the repository section'
  },
  {
    pattern: 'source.other-language',
    description: 'Include another language grammar',
    usage: 'Embed syntax from another language (e.g., JavaScript in HTML)'
  }
];

export const advancedPatternExamples = [
  {
    name: 'String interpolation',
    pattern: {
      name: 'string.quoted.double.interpolated',
      begin: '"',
      end: '"',
      patterns: [
        {
          name: 'constant.character.escape',
          match: '\\\\.'
        },
        {
          name: 'meta.interpolation',
          begin: '\\$\\{',
          end: '\\}',
          patterns: [
            { include: '$self' }
          ]
        }
      ]
    }
  },
  {
    name: 'Nested block comments',
    pattern: {
      name: 'comment.block.nested',
      begin: '/\\*',
      end: '\\*/',
      patterns: [
        { include: '#block-comment' }
      ]
    }
  },
  {
    name: 'Function with typed parameters',
    pattern: {
      name: 'meta.function.definition',
      begin: '\\b(function)\\s+([a-zA-Z_][a-zA-Z0-9_]*)\\s*\\(',
      end: '\\)',
      beginCaptures: {
        '1': { name: 'storage.type.function' },
        '2': { name: 'entity.name.function' }
      },
      patterns: [
        {
          name: 'meta.parameter',
          match: '([a-zA-Z_][a-zA-Z0-9_]*)\\s*:\\s*([a-zA-Z_][a-zA-Z0-9_]*)',
          captures: {
            '1': { name: 'variable.parameter' },
            '2': { name: 'support.type' }
          }
        }
      ]
    }
  }
];
