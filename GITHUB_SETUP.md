# 🚀 推送 TabTidy 到 GitHub

## 步骤 1: 在 GitHub 上创建仓库

1. 访问 https://github.com/new
2. 仓库名称：`tabtidy`
3. 描述：`A smart Chrome extension to organize, save, and restore browser tabs`
4. 选择：**Public** (或 Private，随你)
5. **不要**勾选：
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license

   (因为我们已经本地创建了这些文件)

6. 点击 "Create repository"

## 步骤 2: 连接本地仓库到 GitHub

复制 GitHub 给你的仓库 URL，然后运行：

```bash
cd /home/dempsey/Projects/tabtidy

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/tabtidy.git

# 或者使用 SSH（如果你配置了 SSH key）
git remote add origin git@github.com:YOUR_USERNAME/tabtidy.git

# 推送代码
git push -u origin main
```

## 步骤 3: 验证

访问 `https://github.com/YOUR_USERNAME/tabtidy` 查看你的项目！

---

## 📝 后续更新流程

每次做了修改后：

```bash
# 添加所有改动
git add .

# 提交（用有意义的消息）
git commit -m "feat: add new feature"

# 推送到 GitHub
git push
```

---

## 🔐 如果需要设置 SSH Key

如果你想用 SSH 而不是 HTTPS（推荐），需要先设置 SSH key：

```bash
# 生成 SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# 启动 ssh-agent
eval "$(ssh-agent -s)"

# 添加 SSH key
ssh-add ~/.ssh/id_ed25519

# 显示公钥（复制这个内容）
cat ~/.ssh/id_ed25519.pub
```

然后：
1. 访问 https://github.com/settings/keys
2. 点击 "New SSH key"
3. 粘贴公钥
4. 保存

---

## 📋 记得更新 README 中的链接

推送后，记得更新 README.md 中的 `YOUR_USERNAME`：

1. 打开 `README.md`
2. 全局替换 `YOUR_USERNAME` 为你的实际 GitHub 用户名
3. 提交并推送：
   ```bash
   git add README.md
   git commit -m "docs: update GitHub username in README"
   git push
   ```

---

## ✅ 当前状态

Git 仓库已初始化，包含：
- ✅ 2 个提交
- ✅ 10 个文件（代码）
- ✅ 3 个文档文件（README, LICENSE, CONTRIBUTING）
- ✅ .gitignore 配置完成
- ✅ 在 main 分支上

只需要：
1. 在 GitHub 上创建仓库
2. 添加 remote
3. 推送！

---

## 🎉 完成后你将拥有

- 📦 GitHub 上的开源项目
- 📝 专业的 README 和文档
- 🔄 完整的版本控制
- 👥 可以接受他人贡献
- ⭐ 可以被 star 和 fork
