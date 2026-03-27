# MiniKnowledge — Supabase 数据库配置

## ⚠️ 注意

这份 SQL 会**删除旧表并重建**。由于之前数据没有正确写入，影响不大，但请确认后再运行。

运行位置：Supabase 项目 → SQL Editor → 粘贴 → Run

---

## SQL（直接复制粘贴整段运行）

```sql
-- ============================================================
-- 第一步：清理旧表
-- ============================================================
DROP TABLE IF EXISTS user_answers CASCADE;
DROP TABLE IF EXISTS session_extras CASCADE;
DROP TABLE IF EXISTS session_cards CASCADE;
DROP TABLE IF EXISTS learning_sessions CASCADE;
DROP TABLE IF EXISTS read_later CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;


-- ============================================================
-- 第二步：建表
-- ============================================================

-- 用户信息表
-- 注：密码由 Supabase Auth 内部管理，不存在这里，这里只存展示信息
CREATE TABLE profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username      text,                        -- 用户昵称（注册时填写）
  email         text,                        -- 冗余存一份方便查询
  language      text NOT NULL DEFAULT 'en',  -- 界面语言：'en' 或 'zh'
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 学习会话表
CREATE TABLE learning_sessions (
  id            uuid PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         text NOT NULL,
  source_type   text NOT NULL,                 -- 'url' 或 'text'
  source_url    text,                          -- 原始链接（url 类型时填写）
  source_text   text,                          -- 原文内容（用于 AI 聊天上下文）
  language      text NOT NULL DEFAULT 'en',    -- 生成卡片时的界面语言
  read_mode     text NOT NULL DEFAULT 'deep',  -- 'skim' 略读 或 'deep' 精读
  status        text NOT NULL DEFAULT 'pending', -- 'pending' 待学 或 'completed' 已完成
  bullet_points jsonb,                         -- AI 总结，格式：["要点1", "要点2"]
  score         integer,                       -- 答对题数（完成后写入）
  total_quiz    integer,                       -- 总题数（完成后写入）
  created_at    timestamptz NOT NULL DEFAULT now(),
  completed_at  timestamptz                    -- 完成时间（完成后写入）
);

-- 学习卡片表
CREATE TABLE session_cards (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    uuid NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
  card_index    integer NOT NULL,   -- 卡片顺序，从 0 开始
  card_data     jsonb NOT NULL,     -- 完整卡片 JSON（content / quiz / trueFalse 等）
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 稍后学习表（用户收藏的链接）
CREATE TABLE read_later (
  id            uuid PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url           text NOT NULL,
  title         text NOT NULL,
  description   text,
  added_at      timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- 第三步：索引
-- ============================================================
CREATE INDEX ON learning_sessions (user_id, status, created_at DESC);
CREATE INDEX ON session_cards (session_id, card_index);
CREATE INDEX ON read_later (user_id, added_at DESC);


-- ============================================================
-- 第四步：行级安全（RLS）— 用户只能访问自己的数据
-- ============================================================
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_cards     ENABLE ROW LEVEL SECURITY;
ALTER TABLE read_later        ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: self only"
  ON profiles FOR ALL
  USING (id = auth.uid());

CREATE POLICY "sessions: self only"
  ON learning_sessions FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "cards: via session owner"
  ON session_cards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM learning_sessions
      WHERE id = session_cards.session_id
        AND user_id = auth.uid()
    )
  );

CREATE POLICY "read_later: self only"
  ON read_later FOR ALL
  USING (user_id = auth.uid());


-- ============================================================
-- 第五步：新用户注册时自动创建 profile
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 表结构说明

| 表名 | 存什么 |
|------|--------|
| `profiles` | 用户昵称、邮箱、语言偏好（密码由 Supabase Auth 管理，不在这里） |
| `learning_sessions` | 所有学习会话，含原文、AI 总结、状态（待学/已完成） |
| `session_cards` | 每个会话的卡片内容 |
| `read_later` | 用户收藏的"稍后学习"链接 |

---

## 关于用户名和密码

Supabase 使用 **邮箱 + 密码** 注册登录，密码经过加密存储在 Supabase Auth 内部（不在你的表里，更安全）。

用户注册时传入的 `username` 会通过触发器自动写入 `profiles` 表。

注册代码示例（已在 AuthView 中实现）：
```ts
supabase.auth.signUp({
  email,
  password,
  options: { data: { username } }  // username 会被触发器读取并存入 profiles
})
```

---

## 运行完成后

告知开发者，同步更新代码中的 `db.ts` 读写逻辑。
