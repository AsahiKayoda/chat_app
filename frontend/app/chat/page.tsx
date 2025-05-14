// app/chat/page.tsx
'use client' // この行を書くと「クライアントサイドで動くコンポーネント」になる（必須）

import { useState } from 'react'; // Reactの状態管理フック（useState）を使う
import styles from './chat.module.css'; // 同じフォルダのCSSモジュールを読み込む

// チャット画面のメイン関数（ページコンポーネント）
export default function ChatPage() {
  // 仮のユーザー一覧（後でAPIで取得する）
  const users = ['ユーザーA', 'ユーザーB', 'ユーザーC'];

  // 選択されたユーザーの状態（最初は選ばれていないのでnull）
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // メッセージ入力欄の状態（入力中のテキストを保持）
  const [messageText, setMessageText] = useState('');

  // 今はコンソール出力のみ（APIは後で）
  const handleSendMessage = () => {
  if (!messageText.trim()) return; // 空欄を送信しない
  console.log('送信メッセージ:', messageText);
  setMessageText(''); // 入力欄をリセット
  };

  // 仮のメッセージ一覧（本来はAPIで取得）
  const dummyMessages = [
    { id: 1, text: 'こんにちは！' },
    { id: 2, text: 'お元気ですか？' },
  ];

  return (
    // 💬 全体のラッパー（2カラム構成：左にユーザー一覧・右にチャット）
    <div className={styles.wrapper}>
      {/* 👥 左カラム：ユーザー一覧 */}
      <div className={styles.sidebar}>
        <h3>ユーザー一覧</h3>

        {/* ユーザー一覧をループして表示 */}
        {users.map((user, index) => (
          <div
            key={index}                 // ユニークなキー（Reactでリストを表示するために必要）
            className={styles.user}     // ユーザーの見た目（CSS）
            onClick={() => setSelectedUser(user)} // ユーザーがクリックされたら選択状態を変更
          >
            {user}
          </div>
        ))}
      </div>

      {/* 💬 右カラム：チャットメッセージ表示 */}
      <div className={styles.chatArea}>
        {/* 選ばれた相手がいれば表示、いなければ案内メッセージ */}
        <h3>
          {selectedUser
            ? `${selectedUser}`
            : 'ユーザーを選択してください'}
        </h3>

        {/* メッセージ一覧（スクロール付き） */}
        <div className={styles.messages}>
          {selectedUser &&
            dummyMessages.map((msg) => (
              <div key={msg.id} className={styles.message}>
                {msg.text}
              </div>
            ))}
        </div>
        {/* メッセージ入力 + ボタンエリア */}
        <div className={styles.inputArea}>
             <input
                type="text"
                placeholder="メッセージを入力"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className={styles.messageInput}
            />

            {/* 送信ボタン */}
            <button onClick={handleSendMessage} className={styles.sendButton}>送信</button>
        </div>
      </div>
    </div>
  );
}
