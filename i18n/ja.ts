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
};
