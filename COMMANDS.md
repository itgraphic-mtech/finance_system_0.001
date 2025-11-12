# 🛠️ Common Commands Reference

## 🚀 Development

```bash
# Start dev server
npm run dev

# Build production
npm run build

# Start production server
npm start

# Check for lint errors
npm run lint
```

## 🗄️ Database Management

```bash
# Push schema ไปที่ Database (ใช้ครั้งแรก)
npm run db:push

# สร้าง migration
npm run db:migrate

# Seed ข้อมูลตัวอย่าง
npm run db:seed

# เปิด Prisma Studio (GUI for Database)
npm run db:studio

# ลบและสร้าง Database ใหม่ (ระวัง! ข้อมูลหายไป)
npx prisma db push --force-reset
```

## 🔐 Auth Keys

```bash
# สร้าง NEXTAUTH_SECRET ใหม่
openssl rand -base64 32

# ใน PowerShell (Windows)
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() + (New-Guid).ToString())) | Select-Object -First 32
```

## 📦 Deployment

### Vercel CLI

```bash
# ติดตั้ง Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# ดึง environment variables
vercel env pull

# Deploy
vercel

# Deploy production
vercel --prod

# ดูสถานะ
vercel status

# ดู logs
vercel logs
```

### Database Migrations on Production

```bash
# Pull environment variables
vercel env pull

# รัน migration
npx prisma migrate deploy

# Push schema
npx prisma db push
```

## 🐛 Debugging

```bash
# ลบ node_modules และ reinstall
rm -r node_modules
npm install

# ลบ .next cache
rm -r .next
npm run build

# ตรวจสอบ database connection
npx prisma db execute --stdin

# ดู database schema
npx prisma studio

# Validate schema
npx prisma validate
```

## 📝 Git Commands

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/finance-mtech.git

# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "message"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main

# Create new branch
git checkout -b feature/new-feature

# Switch branch
git checkout main

# Merge branch
git merge feature/new-feature
```

## 🧹 Maintenance

```bash
# Check for outdated packages
npm outdated

# Update packages
npm update

# Update to latest version (careful!)
npm install package@latest

# Remove unused dependencies
npm prune

# Clean npm cache
npm cache clean --force
```

## 📊 Project Info

```bash
# Show current project structure
tree -L 2 -I node_modules

# List all files (Linux/Mac)
find . -type f -not -path "*/node_modules/*" | head -50

# Show git branches
git branch -a

# Show git log
git log --oneline -10

# Show git remotes
git remote -v
```

---

**Note**: เปลี่ยน `npm` เป็น `yarn` ถ้าใช้ Yarn แทน npm
