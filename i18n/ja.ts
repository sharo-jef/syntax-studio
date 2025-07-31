import { Translations } from '../types/i18n';

export const jaTranslations: Translations = {
  app: {
    title: 'Syntax Studio',
    description: '独自言語のシンタックスハイライトを作成',
  },
  
  sidebar: {
    newLanguage: '新しい言語',
    collapse: '折りたたむ',
    expand: '展開する',
    noSavedLanguages: '保存された言語がありません',
    createNewLanguage: '新しい言語を作成してください',
    updated: '更新',
    delete: '削除',
    deleteLanguage: '言語の削除',
    deleteConfirmMessage: '「{name}」を削除しますか？',
    deleteConfirmSubmessage: 'この操作は取り消せません。',
    cancel: 'キャンセル',
    deleteAction: '削除',
  },
  
  panels: {
    sampleCode: 'ソースコード',
    shikiConfig: 'Shiki 設定 (JSON)',
  },
  
  sampleCode: {
    newLanguageSample: '// 新しい言語のソースコード\nfunction hello() {\n  return "Hello, World!";\n}',
    myLanguageSample: '// MyLang ソースコード',
    hello: 'こんにちは',
    world: '世界',
    fibonacci: 'フィボナッチ',
    calculate: '計算',
    greet: '挨拶',
    mainProgram: '// メインプログラム',
    shouldOutput: '// これは55を出力するはずです',
  },
  
  languages: {
    newLanguage: '新しい言語',
    myLanguage: 'マイ言語',
    customLanguage: 'カスタム言語',
  },
  
  languageSwitcher: {
    changeLanguage: '言語を変更',
  },
  
  saveStatus: {
    saved: '保存しました',
    failed: '保存に失敗しました',
  },
  
  help: {
    title: 'Shiki ヘルプ',
    openHelp: 'ヘルプを開く',
    basicUsage: {
      title: '基本的な使い方',
      description: 'Shiki設定は、言語名、表示名、パターンを含むJSON形式で記述します。パターンは正規表現とスコープ名のペアで構成されます。',
    },
    grammarPatterns: {
      title: '文法パターンの種類',
      match: 'match',
      matchDescription: '単一行のパターンマッチングに使用',
      beginEnd: 'begin/end',
      beginEndDescription: '複数行にわたるパターン（コメントブロックなど）に使用',
      include: 'include',
      includeDescription: '他のパターンや外部リポジトリを参照',
    },
    commonScopes: {
      title: 'よく使われるスコープ名',
      keywordControl: '制御構文（if、for、returnなど）',
      stringDouble: 'ダブルクォートで囲まれた文字列',
      commentLine: '単行コメント（// スタイル）',
      commentBlock: 'ブロックコメント（/* */ スタイル）',
      constantNumeric: '数値定数',
      variableOther: '変数名',
      entityFunction: '関数名',
      supportType: 'サポートされている型名',
    },
    regexPatterns: {
      title: 'よく使われる正規表現パターン',
      wordBoundary: '単語境界での完全一致',
      doubleQuotedString: 'ダブルクォート文字列',
      lineComment: '行末までの単行コメント',
      blockComment: 'ブロックコメント（非貪欲マッチ）',
      number: '整数または小数',
      identifier: '識別子（変数名、関数名など）',
    },
    advancedFeatures: {
      title: '高度な機能',
      repository: 'repository',
      repositoryDescription: '再利用可能なパターンを定義し、includeで参照可能',
      captures: 'captures',
      capturesDescription: 'パターン内の特定の部分に異なるスコープを適用',
      while: 'while',
      whileDescription: 'begin/endパターンでの継続条件を指定',
    },
    tips: {
      title: 'ヒントとコツ',
      escapeRegex: '正規表現の特殊文字（.、*、+、?など）は\\でエスケープしてください',
      testPatterns: 'パターンをテストするには、左側のエディタでサンプルコードを入力してください',
      orderMatters: 'パターンの順序は重要です。より具体的なパターンを先に配置してください',
      useMonaco: 'Monaco Editorの自動補完機能を活用して、スコープ名や構造テンプレートを素早く挿入できます',
    },
  },
};
