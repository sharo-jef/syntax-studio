import { useEffect, useRef, useCallback } from 'react';

export const useAutoSave = (
  value: string,
  onSave: (value: string) => void,
  delay: number = 1000
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousValueRef = useRef<string>(value);
  const lastSaveTimeRef = useRef<number>(Date.now());
  const onSaveRef = useRef(onSave);

  // onSave関数の参照を更新（useEffectの依存関係から外すため）
  useEffect(() => {
    onSaveRef.current = onSave;
  });

  useEffect(() => {
    // 値が変更された場合のみ処理
    if (value !== previousValueRef.current) {
      // 既存のタイマーをクリア
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 新しいタイマーを設定
      timeoutRef.current = setTimeout(() => {
        const now = Date.now();
        // 最後の保存から十分時間が経過している場合のみ保存
        if (now - lastSaveTimeRef.current >= delay / 2) {
          onSaveRef.current(value);
          previousValueRef.current = value;
          lastSaveTimeRef.current = now;
        }
      }, delay);
    }

    // クリーンアップ
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]); // onSaveを依存関係から除外

  // 即座に保存する関数を提供
  const saveImmediately = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (value !== previousValueRef.current) {
      onSaveRef.current(value);
      previousValueRef.current = value;
      lastSaveTimeRef.current = Date.now();
    }
  }, [value]);

  // コンポーネントのアンマウント時に最終保存
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // 未保存の変更があれば即座に保存
      if (value !== previousValueRef.current) {
        onSaveRef.current(value);
      }
    };
  }, []); // 空の依存関係配列でアンマウント時のみ実行

  return { saveImmediately };
};
