# Publishing Guide

This guide explains how to publish the `react-snapencode-player` package to npm.

## Prerequisites

1. **NPM Account**: You need an npm account (username: Muntader)
   - If you don't have one, create it at https://www.npmjs.com/signup

2. **NPM Authentication Token**:
   - Login to npm: `npm login`
   - Or create an automation token at https://www.npmjs.com/settings/Muntader/tokens

3. **GitHub Repository Access**: You need write access to this repository

## Publishing Methods

### Method 1: Manual Publishing (Recommended for first-time)

1. **Login to npm**:
   ```bash
   npm login
   ```
   Enter your credentials when prompted.

2. **Build the package**:
   ```bash
   npm run build
   ```

3. **Test the build**:
   ```bash
   npm pack
   ```
   This creates a `.tgz` file that shows exactly what will be published.

4. **Publish to npm**:
   ```bash
   npm publish --access public
   ```

### Method 2: Version-based Publishing

Use npm's version command to update version and publish:

1. **Patch version** (1.0.0 → 1.0.1):
   ```bash
   npm version patch
   npm publish --access public
   ```

2. **Minor version** (1.0.0 → 1.1.0):
   ```bash
   npm version minor
   npm publish --access public
   ```

3. **Major version** (1.0.0 → 2.0.0):
   ```bash
   npm version major
   npm publish --access public
   ```

The `npm version` command will:
- Update `package.json` version
- Run `npm run build` (via `preversion` script)
- Create a git commit and tag
- Push to git (via `postversion` script)

### Method 3: Automated Publishing via GitHub Actions

The repository includes a GitHub Actions workflow that automates publishing.

#### Setup:

1. **Create NPM Token**:
   - Go to https://www.npmjs.com/settings/Muntader/tokens
   - Click "Generate New Token" → "Classic Token"
   - Select "Automation" type
   - Copy the token

2. **Add Token to GitHub Secrets**:
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token
   - Click "Add secret"

#### Trigger Publishing:

**Option A: Create a GitHub Release**
1. Go to your repository on GitHub
2. Click "Releases" → "Create a new release"
3. Create a new tag (e.g., `v1.0.1`)
4. Fill in release details
5. Click "Publish release"
6. GitHub Actions will automatically build and publish to npm

**Option B: Manual Trigger**
1. Go to Actions tab in your GitHub repository
2. Select "Publish to NPM" workflow
3. Click "Run workflow"
4. Optionally specify a version number
5. Click "Run workflow"

## Pre-publish Checklist

Before publishing, ensure:

- [ ] All tests pass
- [ ] Code is properly built (`npm run build`)
- [ ] Version number is updated in `package.json`
- [ ] CHANGELOG is updated (if you have one)
- [ ] README is up to date
- [ ] All changes are committed to git
- [ ] No sensitive information in the package

## Verification After Publishing

1. **Check npm**:
   Visit https://www.npmjs.com/package/react-snapencode-player

2. **Test installation**:
   ```bash
   npm install react-snapencode-player
   ```

3. **Test in a sample project**:
   Create a test React app and import your package to ensure it works correctly.

## Unpublishing (Emergency Only)

If you need to unpublish a version within 72 hours:

```bash
npm unpublish react-snapencode-player@<version>
```

**Warning**: Unpublishing is discouraged by npm. Use `npm deprecate` instead:

```bash
npm deprecate react-snapencode-player@<version> "Reason for deprecation"
```

## Troubleshooting

### "You do not have permission to publish"
- Ensure you're logged in: `npm whoami`
- Check package name availability: `npm search react-snapencode-player`
- Use `--access public` flag for scoped packages

### "Package already exists"
- The package name might be taken
- Consider using a scoped package: `@muntader/react-snapencode-player`
- Update the version number if you're re-publishing

### Build fails
- Run `npm run clean` then `npm run build`
- Ensure all dependencies are installed: `npm install`
- Check for TypeScript errors: `npm run build:types`

## Best Practices

1. **Semantic Versioning**: Follow semver (major.minor.patch)
   - MAJOR: Breaking changes
   - MINOR: New features (backward compatible)
   - PATCH: Bug fixes

2. **Test Before Publishing**: Always test the built package

3. **Keep README Updated**: Ensure installation and usage docs are current

4. **Use Git Tags**: Tag releases for better version tracking

5. **Changelog**: Maintain a CHANGELOG.md for version history

## Support

For issues or questions:
- GitHub Issues: https://github.com/Muntader/snapencode-player/issues
- NPM Package: https://www.npmjs.com/package/react-snapencode-player
