'use client';

import styles from '../chat.module.css';
import { sendMessage, uploadAttachment } from '../services/chatService';
import { useState } from 'react';
// @ts-ignore
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

type Props = {
  roomId: number;
  currentUserId: number;
  onMessageSent: () => void;
};

export default function MessageForm({ roomId, currentUserId, onMessageSent }: Props) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [showPicker, setShowPicker] = useState(false);

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

  const extractMentionUsernames = (input: string): string[] => {
    const matches = input.match(/@(\w+)/g);
    return matches ? matches.map((m) => m.substring(1)) : [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!text.trim() && !previewFile) return;

    try {
      const fallbackText = text.trim() || '画像を送信しました';
      const mentionUsernames = extractMentionUsernames(fallbackText);
      const message = await sendMessage(Number(roomId), fallbackText, mentionUsernames);
      console.log('✅ メッセージ送信成功: message.id =', message.id);

      if (previewFile) {
        await uploadAttachment(message.id, previewFile);
        setPreviewFile(null);
        setPreviewUrl(null);
      }

      setText('');
      setShowPicker(false);
      onMessageSent();
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

      {/* 😊 emoji picker toggle */}
      <button type="button" className={styles.fileButton} onClick={() => setShowPicker((prev) => !prev)}>
        😊
      </button>

      {/* テキスト入力 */}
      <input
        type="text"
        placeholder="メッセージを入力"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={styles.messageInput}
      />

      {/* Emoji Picker 本体 */}
      {showPicker && (
        <div style={{ position: 'absolute', bottom: '60px', zIndex: 10 }}>
          <Picker
            data={data}
            onEmojiSelect={(emoji: any) => {
              setText((prev) => prev + emoji.native);
              setShowPicker(false);
            }}
            theme="light"
          />
        </div>
      )}

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