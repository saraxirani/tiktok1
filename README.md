# TikTok Follower Extractor

A powerful Node.js application for extracting real TikTok followers using ChromeDriver automation. This tool authenticates with real accounts and extracts only genuine follower data.

## Features

- ✅ **Real Follower Extraction** - Only extracts actual followers, no fake data
- 🔐 **Session Management** - Saves and reuses login sessions
- 🌐 **Non-Headless Browser** - Visible ChromeDriver for monitoring
- 🚀 **GitHub Actions Support** - Automated CI/CD deployment
- 🎯 **Target Account Support** - Process multiple accounts from target.txt
- 📝 **Detailed Logging** - English interface with Persian explanations
- 💾 **Structured Output** - Clean, formatted result files
- ⏱️ **Rate Limiting** - Built-in delays to prevent blocking

## Requirements

- Node.js 14.0.0 or higher
- Chrome/Chromium browser
- Internet connection

## Installation

### Local Development

1. Clone or download the project
2. Install dependencies:
```bash
npm install
```

### GitHub Deployment

1. Push to GitHub repository
2. GitHub Actions will automatically:
   - Test the code syntax
   - Install dependencies
   - Run the extractor in headless mode
   - Save results as artifacts

## Usage

### Local Quick Start

1. Add target accounts to `target.txt` (one per line)
2. Run the extractor:
```bash
npm start
```

### GitHub Actions

The workflow automatically triggers on:
- Push to `main`/`master` branch
- Pull requests
- Manual workflow dispatch

**Manual Run:**
1. Go to Actions tab in GitHub
2. Select "TikTok Follower Extractor CI/CD"
3. Click "Run workflow"
4. Check "Run TikTok follower extractor" option

## Environment Variables (GitHub)

Optional environment variables for GitHub Actions:
- `TIKTOK_USERNAME` - Override default username
- `TIKTOK_PASSWORD` - Override default password
- `HEADLESS` - Set to 'false' for debugging (not recommended in CI)

## File Structure

```
tiktok-follower-extractor/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions workflow
├── index.js                # Main application with TikTokExtractor class
├── package.json            # Node.js dependencies and scripts
├── target.txt              # Target accounts list
├── .gitignore              # Git ignore file
├── session.json            # Saved login sessions (auto-generated)
├── output/                 # Extracted follower data (auto-generated)
└── README.md               # This documentation
```

## Output Format

When real followers are found, results are saved in `output/` with format:

```
TikTok Followers for @username
Extraction Method: ChromeDriver
Extraction Date: 2026-03-10T01:30:45.123Z
Total Followers: 1000
Authentication: Yes

EXTRACTION DETAILS:

Method: ChromeDriver
Session: Authenticated
Browser: ChromeDriver (Non-Headless)
Quality: Real Data Only

FOLLOWER LIST:
@follower1
@follower2
@follower3
...
```

**GitHub Actions Output:**
- Results are uploaded as artifacts
- Available for 30 days
- Downloadable from workflow run page

## How It Works

### Local Mode
1. **Session Check**: Tries to load saved session cookies
2. **Authentication**: If no valid session, logs in with provided credentials
3. **Target Navigation**: Goes to each target account's profile
4. **Follower Extraction**: Opens followers modal and scrapes real usernames
5. **Data Validation**: Only saves results if real followers are found
6. **Session Persistence**: Saves session for future runs

### GitHub Actions Mode
1. **Setup**: Installs Chrome dependencies in Ubuntu
2. **Headless Mode**: Runs browser in headless mode for CI/CD
3. **Automated Extraction**: Processes target accounts automatically
4. **Artifact Upload**: Saves results as downloadable artifacts
5. **Summary Report**: Creates workflow summary with results

## Scripts

- `npm start` - Run local extractor
- `npm test` - Validate code syntax and dependencies
- `npm run ci` - Run CI version (headless mode)
- `npm run validate` - Check dependencies only

## Important Notes

- **No Fake Data**: The application only extracts and saves real followers
- **Error Handling**: If no real followers are found, the program stops with an error
- **Visible Browser**: Local runs in non-headless mode for monitoring
- **Headless CI**: GitHub Actions run in headless mode for automation
- **Rate Limiting**: Includes delays between requests to avoid detection
- **Session Management**: Automatically saves and reuses login sessions

## Error Messages

The application provides detailed error messages in both English and Persian:

- **No real followers found**: Stops execution if no genuine followers are extracted
- **Login failed**: Reports authentication issues
- **Profile not found**: Indicates invalid target usernames
- **Session expired**: Automatically handles session renewal

## Security Considerations

- Credentials are stored in the source code (for demo purposes)
- **GitHub Secrets**: For production, use GitHub Actions secrets:
  ```yaml
  env:
    TIKTOK_USERNAME: ${{ secrets.TIKTOK_USERNAME }}
    TIKTOK_PASSWORD: ${{ secrets.TIKTOK_PASSWORD }}
  ```
- Sessions are saved locally in `session.json`
- Browser runs in visible mode locally, headless in CI
- No data is sent to external servers

## Troubleshooting

### Common Issues

1. **Login Failures**
   - Check username/password credentials
   - Ensure TikTok hasn't blocked the account
   - Try manual login first

2. **No Followers Found**
   - Verify target account exists and has followers
   - Check if account is private
   - Ensure proper network connectivity

3. **Browser Issues**
   - Update Chrome/Chromium to latest version
   - Check system resources
   - Ensure no firewall blocking

4. **GitHub Actions Issues**
   - Check workflow logs for errors
   - Verify Chrome dependencies installation
   - Review artifact upload status

### Debug Mode

**Local:** The application runs in visible browser mode by default.

**GitHub Actions:** Set `HEADLESS: false` in workflow for debugging (not recommended).

Monitor the browser window to:
- Watch the login process
- Verify navigation to target profiles
- See follower extraction in real-time
- Identify any blocking or captcha issues

## Dependencies

- **puppeteer**: Browser automation
- **fs-extra**: Enhanced file system operations

## License

MIT License

## Disclaimer

This tool is for educational purposes only. Users are responsible for:
- Complying with TikTok's Terms of Service
- Respecting privacy and data protection laws
- Using the tool ethically and responsibly

The developers are not responsible for misuse of this software.

## GitHub Actions Workflow

The `.github/workflows/deploy.yml` file includes:
- **Multi-node testing**: Tests on Node.js 16.x, 18.x, 20.x
- **Chrome dependency installation**: Sets up Chrome for Ubuntu
- **Automated extraction**: Runs in headless mode
- **Artifact management**: Saves and uploads results
- **Error handling**: Comprehensive error reporting
- **Manual dispatch**: Can be triggered manually

**Workflow Triggers:**
- Push to main/master
- Pull requests
- Manual workflow dispatch
