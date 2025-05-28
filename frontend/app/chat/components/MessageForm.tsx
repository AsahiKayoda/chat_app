'use client'

import { useState } from 'react';
import styles from '../chat.module.css';
import { sendMessage, uploadAttachment } from '../services/chatService';

type Props = {
  roomId: number;
  currentUserId: number;
  onMessageSent: () => void; // メッセージ取得トリガーなど
};

export default function MessageForm({ roomId, currentUserId, onMessageSent }: Props) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("画像サイズが大きすぎます（最大5MB）");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setPreviewFile(file);
  };

// 🔍 メンションを抽出する関数（@username を抽出して ["username", ...] に）
  const extractMentionUsernames = (input: string): string[] => {
    const matches = input.match(/@(\w+)/g);
    return matches ? matches.map((m) => m.substring(1)) : [];
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (!text.trim() && !previewFile) return;

  try {

    // ✅ 空の text のときは自動補完（画像のみ送信対策）
    const fallbackText = text.trim() || '画像を送信しました';
    // ✅ メンションユーザー名を抽出
    const mentionUsernames = extractMentionUsernames(fallbackText);
    // ✅ sendMessage を呼び出して messageId を取得
    const message = await sendMessage(Number(roomId), fallbackText, mentionUsernames);
    console.log('✅ メッセージ送信成功: message.id =', message.id);
    // ✅ 添付ファイルがある場合にアップロード
    if (previewFile) {
      await uploadAttachment(message.id, previewFile); // ← sendMessage が返す message.id を使う
      setPreviewFile(null);
      setPreviewUrl(null);
    }

      setText('');
      onMessageSent(); // メッセージ再取得トリガー
    } catch (err) {
      console.error(err);
      setError('送信に失敗しました');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.inputArea}>
      {/* 📎 ファイル選択ボタン */}
      <label className={styles.fileButton}>
        📎
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </label>

      {/* テキスト入力 */}
      <input
        type="text"
        placeholder="メッセージを入力"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={styles.messageInput}
      />

      {/* プレビュー画像 */}
      {previewUrl && (
        <div className={styles.imagePreview}>
          <img src={previewUrl} alt="プレビュー画像" className={styles.attachmentImage} />
          <button type="button" onClick={() => {
            setPreviewUrl(null);
            setPreviewFile(null);
          }}>✖</button>
        </div>
      )}

      {/* 送信ボタン */}
      <button type="submit" className={styles.sendButton}>送信</button>

      {error && <p style={{ color: 'red', marginTop: 8 }}>{error}</p>}
    </form>
  );
}
