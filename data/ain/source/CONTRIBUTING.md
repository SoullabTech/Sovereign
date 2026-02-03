# Contributing to SpiralogicOracleSystem

Thank you for your interest in contributing! This guide will help you get started and avoid common pitfalls.

## 🚀 Quick Start

1. Fork the repository
2. Clone your fork with submodules:
   ```bash
   git clone --recursive <your-fork-url>
   cd SpiralogicOracleSystem
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run development server:
   ```bash
   npm run dev
   ```

## 🔴 CRITICAL: Submodule Management

### ⚠️ Important Warning
This project contains git submodules that **MUST NOT** be included in TypeScript compilation or deployment builds. Failure to exclude them will result in thousands of phantom errors.

### Submodules in This Project
- `SpiralogicOracleSystem/`
- `sesame-csm/`
- `sesame_csm_openai/`
- `csm/`
- `backend/backend/`
- `backend/csm/`

### Required Exclusions
These submodules are already excluded in:
- ✅ `tsconfig.json` - TypeScript compilation
- ✅ `.vercelignore` - Vercel deployments  
- ✅ `.eslintignore` - ESLint checks

**DO NOT REMOVE THESE EXCLUSIONS!**

## 📝 Before You Commit

### 1. Type Check
```bash
npx tsc --noEmit
```
Should return **zero errors**. If you see thousands of errors, check that submodules are excluded.

### 2. Lint Check
```bash
npm run lint
```

### 3. Build Test
```bash
npm run build
```

### 4. Clean Up macOS Files
```bash
# Remove extended attribute files that cause issues
find . -name ".!*" -delete
```

## 🏗️ Development Guidelines

### File Structure
```
├── app/          # Next.js app directory (pages and API routes)
├── components/   # React components
├── lib/          # Shared libraries and utilities
├── public/       # Static assets (deprecated - use /docs/assets/)
├── styles/       # Global styles
└── docs/         # All documentation and assets
    ├── assets/   # All images and media files
    │   ├── ui/          # UI screenshots
    │   ├── holoflower/  # Sacred symbols & geometry
    │   ├── storyboards/ # UX flows & wireframes
    │   ├── branding/    # Logos & brand assets
    │   ├── diagrams/    # Architecture & schemas
    │   └── misc/        # Uncategorized assets
    └── *.md      # All markdown documentation
```

### Code Style
- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Keep components small and focused
- Use meaningful variable and function names

### API Routes
- Place new API routes in `app/api/`
- Use proper error handling
- Return consistent response formats
- Add TypeScript types for request/response

### Stubs and Mocks
When backend services are unavailable, use stubs from `lib/stubs/`:
```typescript
import { CollectiveIntelligence } from '@/lib/stubs/CollectiveIntelligence';
```

### 📂 Assets Guidelines

#### Image Placement Rules
- **ALL images MUST live in `/docs/assets/`** - no exceptions!
- Images placed elsewhere will be **automatically moved** by pre-commit hooks
- The system will auto-categorize based on filename and content

#### Asset Categories
- `ui/` → UI screenshots, interface mockups
- `holoflower/` → Sacred symbols, geometry, Aether states
- `storyboards/` → UX flows, user journeys, wireframes
- `branding/` → Logos, brand assets, icons
- `diagrams/` → Architecture diagrams, schemas
- `misc/` → Uncategorized (default if unclear)

#### Naming Conventions
To control categorization, prefix your filename:
- `ui-dashboard.png` → goes to `/docs/assets/ui/`
- `holoflower-sacred.png` → goes to `/docs/assets/holoflower/`
- `storyboard-onboarding.png` → goes to `/docs/assets/storyboards/`
- `logo-main.svg` → goes to `/docs/assets/branding/`
- `diagram-architecture.png` → goes to `/docs/assets/diagrams/`

#### Auto-Fix Available
If images are misplaced:
```bash
npm run docs:fix  # Moves images and updates references
```

#### Sacred Geometry Preservation
The Holoflower and Aether state visualizations are sacred assets:
- Always preserved in `/docs/assets/holoflower/`
- Never compressed or altered
- Maintain original resolution and quality

## 🐛 Reporting Issues

### Before Reporting
1. Check existing issues
2. Verify you have the latest code
3. Ensure submodules are properly excluded
4. Try a clean install:
   ```bash
   rm -rf node_modules .next
   npm install
   npm run build
   ```

### Issue Template
```markdown
**Description:**
Brief description of the issue

**Steps to Reproduce:**
1. Step one
2. Step two
3. ...

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Node version: 
- OS: 
- Browser (if applicable):
```

## 🔄 Pull Request Process

### Before Submitting
1. ✅ All tests pass
2. ✅ TypeScript has zero errors
3. ✅ Code is linted
4. ✅ Build succeeds
5. ✅ No submodule code included

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] TypeScript check passes
- [ ] Build succeeds

## Checklist
- [ ] No submodule files modified
- [ ] No `.!` files included
- [ ] Following existing code patterns
```

## 🚫 Common Mistakes to Avoid

### 1. Including Submodules in Builds
**Never** remove submodules from exclusion lists in:
- `tsconfig.json`
- `.vercelignore`
- `.eslintignore`

### 2. Committing macOS Extended Attributes
Files starting with `.!` should never be committed:
```bash
# Check for these files
find . -name ".!*" -not -path "./node_modules/*"

# Remove them
find . -name ".!*" -delete
```

### 3. Modifying Submodule Contents
Submodules should be updated through their own repositories, not through this project.

### 4. Importing from Submodules
Don't import directly from submodule source:
```typescript
// ❌ Wrong
import { Something } from '../sesame-csm/src/something';

// ✅ Correct - use stubs or built artifacts
import { Something } from '@/lib/stubs/Something';
```

## 🔧 Troubleshooting

### "25,000+ TypeScript errors"
**Cause:** Submodules being compiled
**Fix:** Ensure `tsconfig.json` excludes all submodules

### "Build fails on Vercel but works locally"
**Cause:** `.vercelignore` missing entries
**Fix:** Check that all submodules are in `.vercelignore`

### "Cannot find module" errors
**Cause:** Trying to import from submodules
**Fix:** Use stub implementations from `lib/stubs/`

## 📚 Additional Resources

- [Submodule Best Practices](./docs/SUBMODULE_BEST_PRACTICES.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 💬 Getting Help

- Open an issue for bugs
- Start a discussion for questions
- Check existing issues first

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Remember:** When in doubt, exclude submodules! They should be invisible to the main build process.