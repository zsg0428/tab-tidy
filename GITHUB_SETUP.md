# 🚀 Pushing TabTidy to GitHub

## Step 1: Create Repository on GitHub

1. Visit https://github.com/new
2. Repository name: `tab-tidy`
3. Description: `A smart Chrome extension to organize, save, and restore browser tabs`
4. Choose: **Public** (or Private, your choice)
5. **Do NOT** check:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license

   (We already created these files locally)

6. Click "Create repository"

## Step 2: Connect Local Repository to GitHub

Copy the repository URL from GitHub, then run:

```bash
cd /home/dempsey/Projects/tabtidy

# Add remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/tab-tidy.git

# Or use SSH (if you have SSH keys configured)
git remote add origin git@github.com:YOUR_USERNAME/tab-tidy.git

# Push code
git push -u origin main
```

## Step 3: Verify

Visit `https://github.com/YOUR_USERNAME/tab-tidy` to see your project!

---

## 📝 Future Update Workflow

After making changes:

```bash
# Add all changes
git add .

# Commit with meaningful message
git commit -m "feat: add new feature"

# Push to GitHub
git push
```

---

## 🔐 Setting Up SSH Key (Optional)

If you prefer SSH over HTTPS (recommended):

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Start ssh-agent
eval "$(ssh-agent -s)"

# Add SSH key
ssh-add ~/.ssh/id_ed25519

# Display public key (copy this)
cat ~/.ssh/id_ed25519.pub
```

Then:
1. Visit https://github.com/settings/keys
2. Click "New SSH key"
3. Paste the public key
4. Save

---

## 📋 Remember to Update README Links

After pushing, update `YOUR_USERNAME` in README.md:

1. Open `README.md`
2. Replace all `YOUR_USERNAME` with your actual GitHub username
3. Commit and push:
   ```bash
   git add README.md
   git commit -m "docs: update GitHub username in README"
   git push
   ```

---

## ✅ Current Status

Git repository initialized with:
- ✅ 4 commits
- ✅ 10 code files
- ✅ 3 documentation files (README, LICENSE, CONTRIBUTING)
- ✅ .gitignore configured
- ✅ On main branch

Next steps:
1. Create repository on GitHub
2. Add remote
3. Push!

---

## 🎉 After Completion You'll Have

- 📦 Open source project on GitHub
- 📝 Professional README and documentation
- 🔄 Complete version control
- 👥 Accept contributions from others
- ⭐ Can be starred and forked

---

## 🔒 Configuring Repository Protection

After pushing, protect your main branch from direct modifications:

### Step 1: Go to Repository Settings
1. Visit `https://github.com/YOUR_USERNAME/tab-tidy/settings`
2. Click on "Branches" in the left sidebar

### Step 2: Add Branch Protection Rule
1. Click "Add branch protection rule"
2. Branch name pattern: `main`

### Step 3: Configure Protection Rules

**Recommended Settings:**

- ✅ **Require a pull request before merging**
  - ✅ Require approvals: 1 (if working with others)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ⬜ Require review from Code Owners (optional)

- ✅ **Require status checks to pass before merging** (if you set up CI/CD)
  - ✅ Require branches to be up to date before merging

- ✅ **Require conversation resolution before merging**
  - All comment threads must be resolved

- ✅ **Require signed commits** (optional, for extra security)

- ✅ **Include administrators**
  - Rules apply to you too (recommended for consistency)

- ⬜ **Restrict who can push to matching branches**
  - Leave unchecked if you're the only maintainer
  - Check if you want to specify who can push

- ✅ **Allow force pushes** - ❌ DISABLE THIS
  - Prevents destructive git force pushes

- ✅ **Allow deletions** - ❌ DISABLE THIS
  - Prevents accidental branch deletion

### Step 4: Save Changes

Click "Create" or "Save changes"

---

## 🛡️ Additional Security Settings

### 1. Enable Dependabot (for dependencies)
Go to Settings → Code security and analysis:
- ✅ Enable Dependabot alerts
- ✅ Enable Dependabot security updates

### 2. Manage Collaborator Access
Settings → Collaborators and teams:
- Add collaborators with appropriate permissions:
  - **Read**: Can view and clone
  - **Triage**: Can manage issues/PRs
  - **Write**: Can push to non-protected branches
  - **Maintain**: Can manage repo without destructive actions
  - **Admin**: Full access

### 3. Set Up Issue Templates
Create `.github/ISSUE_TEMPLATE/` directory with templates for:
- Bug reports
- Feature requests
- Questions

### 4. Set Up Pull Request Template
Create `.github/PULL_REQUEST_TEMPLATE.md` for consistent PRs

---

## 📊 Workflow After Protection Setup

### For You (Owner):
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
git add .
git commit -m "feat: add new feature"

# Push branch
git push origin feature/new-feature

# Create PR on GitHub
# Merge after review
```

### For Contributors:
1. Fork the repository
2. Clone their fork
3. Create feature branch
4. Make changes and commit
5. Push to their fork
6. Create Pull Request to your main branch
7. You review and merge

---

## 🎯 Summary

**Before protection:**
- Anyone with write access can push directly to main ❌

**After protection:**
- All changes must go through Pull Requests ✅
- Can require reviews before merging ✅
- Protects against accidental deletions ✅
- Maintains clean commit history ✅

**Your workflow stays simple:**
```bash
# Branch → Commit → Push → PR → Merge
```

Everything is protected and organized! 🎉
