export const sampleLanguageConfigs = {
  myLang: {
    languageConfig: {
      id: 'mylang',
      name: 'MyLang',
      extensions: ['.mylang'],
      aliases: ['mylang', 'MyLanguage'],
      configuration: {
        comments: {
          lineComment: '//',
          blockComment: ['/*', '*/'],
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')'],
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
        ],
      },
      tokenizer: {
        root: [
          { regex: /\b(func|var|if|else|while|for|return|true|false|null)\b/, action: 'keyword' },
          { regex: /"([^"\\]|\\.)*$/, action: 'string.invalid' },
          { regex: /"/, action: { token: 'string.quote', next: 'string' } },
          { regex: /\/\/.*$/, action: 'comment' },
          { regex: /\/\*/, action: { token: 'comment', next: 'comment' } },
          { regex: /\d+(\.\d+)?/, action: 'number' },
          { regex: /[a-zA-Z_][a-zA-Z0-9_]*/, action: 'identifier' },
          { regex: /[{}()\[\]]/, action: 'bracket' },
          { regex: /[<>]=?|[!=]=?|&&|\|\||[+\-*\/=]/, action: 'operator' },
        ],
        string: [
          { regex: /[^\\"]+/, action: 'string' },
          { regex: /\\./, action: 'string.escape' },
          { regex: /"/, action: { token: 'string.quote', next: 'pop' } },
        ],
        comment: [
          { regex: /[^\/*]+/, action: 'comment' },
          { regex: /\*\//, action: { token: 'comment', next: 'pop' } },
          { regex: /[\/*]/, action: 'comment' },
        ],
      },
    },
    shikiConfig: {
      name: 'mylang',
      displayName: 'MyLang',
      aliases: ['mylang'],
      patterns: [
        {
          name: 'keyword.control.mylang',
          match: '\\b(func|var|if|else|while|for|return)\\b',
        },
        {
          name: 'constant.language.mylang',
          match: '\\b(true|false|null)\\b',
        },
        {
          name: 'string.quoted.double.mylang',
          begin: '"',
          end: '"',
          patterns: [
            {
              name: 'constant.character.escape.mylang',
              match: '\\\\.',
            },
          ],
        },
        {
          name: 'comment.line.double-slash.mylang',
          match: '//.*$',
        },
        {
          name: 'comment.block.mylang',
          begin: '/\\*',
          end: '\\*/',
        },
        {
          name: 'constant.numeric.mylang',
          match: '\\b\\d+(\\.\\d+)?\\b',
        },
        {
          name: 'keyword.operator.mylang',
          match: '[<>]=?|[!=]=?|&&|\\|\\||[+\\-*/=]',
        },
        {
          name: 'punctuation.bracket.mylang',
          match: '[{}()\\[\\]]',
        },
      ],
    },
    sampleCode: `// MyLang Sample Code
func fibonacci(n) {
    if (n <= 1) {
        return n;
    }
    var a = 0;
    var b = 1;
    for (var i = 2; i <= n; i++) {
        var temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}

func main() {
    var result = fibonacci(10);
    // This should output 55
    return result;
}`,
  },

  simpleLang: {
    languageConfig: {
      id: 'simplelang',
      name: 'SimpleLang',
      extensions: ['.simple'],
      aliases: ['simple', 'SimpleLang'],
      configuration: {
        comments: {
          lineComment: '#',
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')'],
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '"', close: '"' },
        ],
      },
      tokenizer: {
        root: [
          { regex: /\b(def|end|if|then|else|print|input)\b/, action: 'keyword' },
          { regex: /"[^"]*"/, action: 'string' },
          { regex: /#.*$/, action: 'comment' },
          { regex: /\d+/, action: 'number' },
          { regex: /[a-zA-Z_][a-zA-Z0-9_]*/, action: 'identifier' },
          { regex: /[+\-*\/=]/, action: 'operator' },
        ],
      },
    },
    shikiConfig: {
      name: 'simplelang',
      displayName: 'SimpleLang',
      aliases: ['simple'],
      patterns: [
        {
          name: 'keyword.control.simplelang',
          match: '\\b(def|end|if|then|else|print|input)\\b',
        },
        {
          name: 'string.quoted.double.simplelang',
          match: '"[^"]*"',
        },
        {
          name: 'comment.line.hash.simplelang',
          match: '#.*$',
        },
        {
          name: 'constant.numeric.simplelang',
          match: '\\b\\d+\\b',
        },
        {
          name: 'keyword.operator.simplelang',
          match: '[+\\-*/=]',
        },
      ],
    },
    sampleCode: `# SimpleLang Sample Code
def greet(name)
    if name
        print "Hello, " + name + "!"
    else
        print "Hello, World!"
    end
end

def calculate(a, b)
    return a + b * 2
end

# Main program
greet("Alice")
print calculate(5, 3)`,
  },
};
