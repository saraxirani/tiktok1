const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

class TikTokExtractor {
    constructor() {
        this.browser = null;
        this.page = null;
        this.sessionPath = path.join(__dirname, 'session.json');
        this.outputDir = path.join(__dirname, 'output');
        this.credentials = {
            username: 'dinticxxx',
            password: 'Razer!1369'
        };
        this.delays = {
            short: 1000,
            medium: 3000,
            long: 5000
        };
    }

    async init() {
        console.log('🚀 Initializing TikTok Extractor...');
        console.log('📝 در حال راه‌اندازی استخراج‌کننده تیک‌تاک...');
        
        await fs.ensureDir(this.outputDir);
        
        this.browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        });

        this.page = await this.browser.newPage();
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        console.log('✅ Browser launched successfully');
        console.log('✅ مرورگر با موفقیت راه‌اندازی شد');
    }

    async loadSession() {
        try {
            if (await fs.pathExists(this.sessionPath)) {
                const sessionData = await fs.readJson(this.sessionPath);
                const cookies = sessionData.cookies || [];
                
                await this.page.goto('https://www.tiktok.com/', { waitUntil: 'networkidle2' });
                await this.page.setCookie(...cookies);
                await this.page.reload({ waitUntil: 'networkidle2' });
                
                // Check if session is still valid
                const isLoggedIn = await this.checkLoginStatus();
                
                if (isLoggedIn) {
                    console.log('✅ Session loaded successfully');
                    console.log('✅ جلسه با موفقیت بارگذاری شد');
                    return true;
                } else {
                    console.log('⚠️ Session expired, need to login again');
                    console.log('⚠️ جلسه منقضی شده، نیاز به ورود مجدد');
                    return false;
                }
            }
        } catch (error) {
            console.log('❌ Failed to load session:', error.message);
            console.log('❌ خطا در بارگذاری جلسه:', error.message);
        }
        return false;
    }

    async checkLoginStatus() {
        try {
            await this.page.waitForTimeout(this.delays.short);
            
            // Look for user profile or login button
            const isLoggedIn = await this.page.evaluate(() => {
                const profileButton = document.querySelector('[data-e2e="profile-icon"]');
                const loginButton = document.querySelector('[data-e2e="login-button"]');
                return !!profileButton && !loginButton;
            });
            
            return isLoggedIn;
        } catch (error) {
            console.log('❌ Error checking login status:', error.message);
            return false;
        }
    }

    async login() {
        console.log('🔐 Starting login process...');
        console.log('🔐 شروع فرآیند ورود...');
        
        try {
            await this.page.goto('https://www.tiktok.com/login', { waitUntil: 'networkidle2' });
            await this.page.waitForTimeout(this.delays.medium);

            // Click on username/password login option
            await this.page.click('[data-e2e="channel-item-2"]');
            await this.page.waitForTimeout(this.delays.short);

            // Enter username
            await this.page.type('input[placeholder*="username" i], input[placeholder*="phone" i], input[type="text"]', 
                this.credentials.username, { delay: 100 });
            
            await this.page.waitForTimeout(this.delays.short);

            // Enter password
            const passwordInputs = await this.page.$$('input[type="password"]');
            if (passwordInputs.length > 0) {
                await passwordInputs[0].type(this.credentials.password, { delay: 100 });
            }

            await this.page.waitForTimeout(this.delays.short);

            // Click login button
            const loginButton = await this.page.$('[data-e2e="login-button"], button[type="submit"]');
            if (loginButton) {
                await loginButton.click();
                await this.page.waitForTimeout(this.delays.long);
            }

            // Check if login was successful
            const isLoggedIn = await this.checkLoginStatus();
            
            if (isLoggedIn) {
                console.log('✅ Login successful!');
                console.log('✅ ورود با موفقیت انجام شد!');
                
                // Save session
                await this.saveSession();
                return true;
            } else {
                console.log('❌ Login failed!');
                console.log('❌ ورود ناموفق بود!');
                return false;
            }

        } catch (error) {
            console.log('❌ Login error:', error.message);
            console.log('❌ خطا در ورود:', error.message);
            return false;
        }
    }

    async saveSession() {
        try {
            const cookies = await this.page.cookies();
            const sessionData = {
                cookies: cookies,
                timestamp: new Date().toISOString()
            };
            
            await fs.writeJson(this.sessionPath, sessionData);
            console.log('💾 Session saved successfully');
            console.log('💾 جلسه با موفقیت ذخیره شد');
        } catch (error) {
            console.log('❌ Failed to save session:', error.message);
            console.log('❌ خطا در ذخیره جلسه:', error.message);
        }
    }

    async extractFollowers(username) {
        console.log(`🎯 Extracting followers for @${username}...`);
        console.log(`🎯 در حال استخراج فالورهای @${username}...`);
        
        try {
            // Navigate to user profile
            const profileUrl = `https://www.tiktok.com/@${username}`;
            await this.page.goto(profileUrl, { waitUntil: 'networkidle2' });
            await this.page.waitForTimeout(this.delays.medium);

            // Check if profile exists
            const profileExists = await this.page.evaluate(() => {
                const notFound = document.querySelector('[data-e2e="error-page"]');
                return !notFound;
            });

            if (!profileExists) {
                console.log(`❌ Profile @${username} not found!`);
                console.log(`❌ پروفایل @${username} یافت نشد!`);
                return [];
            }

            // Look for followers button/count
            const followersButton = await this.page.$('[data-e2e="followers-count"]');
            
            if (!followersButton) {
                console.log(`❌ Could not find followers button for @${username}!`);
                console.log(`❌ دکمه فالورها برای @${username} یافت نشد!`);
                return [];
            }

            // Click on followers to open the modal
            await followersButton.click();
            await this.page.waitForTimeout(this.delays.medium);

            // Wait for followers modal to load
            await this.page.waitForSelector('[data-e2e="user-list"]', { timeout: 10000 });

            console.log('📋 Followers modal opened, starting extraction...');
            console.log('📋 پنجره فالورها باز شد، شروع استخراج...');

            const followers = await this.scrapeFollowersFromModal();

            if (followers.length === 0) {
                console.log('❌ No real followers found!');
                console.log('❌ هیچ فالور واقعی یافت نشد!');
                throw new Error('No real followers found - هیچ فالور واقعی یافت نشد');
            }

            console.log(`✅ Successfully extracted ${followers.length} real followers!`);
            console.log(`✅ با موفقیت ${followers.length} فالور واقعی استخراج شد!`);
            
            return followers;

        } catch (error) {
            console.log('❌ Error extracting followers:', error.message);
            console.log('❌ خطا در استخراج فالورها:', error.message);
            throw error;
        }
    }

    async scrapeFollowersFromModal() {
        const followers = new Set();
        let previousCount = 0;
        let scrollAttempts = 0;
        const maxScrollAttempts = 50;

        console.log('🔄 Starting to scrape followers from modal...');
        console.log('🔄 شروع استخراج فالورها از پنجره...');

        while (scrollAttempts < maxScrollAttempts) {
            try {
                // Get current followers in view
                const currentFollowers = await this.page.evaluate(() => {
                    const userElements = document.querySelectorAll('[data-e2e="user-list-item"]');
                    const usernames = [];
                    
                    userElements.forEach(element => {
                        const usernameElement = element.querySelector('a');
                        if (usernameElement) {
                            const href = usernameElement.getAttribute('href');
                            if (href && href.includes('/@')) {
                                const username = href.split('/@')[1].split('?')[0];
                                if (username && username !== '') {
                                    usernames.push('@' + username);
                                }
                            }
                        }
                    });
                    
                    return usernames;
                });

                // Add new followers to set
                currentFollowers.forEach(follower => followers.add(follower));

                // Check if we got new followers
                if (followers.size === previousCount) {
                    scrollAttempts++;
                    console.log(`📊 No new followers found, attempt ${scrollAttempts}/${maxScrollAttempts}`);
                    console.log(`📊 فالور جدیدی یافت نشد، تلاش ${scrollAttempts}/${maxScrollAttempts}`);
                } else {
                    scrollAttempts = 0;
                    previousCount = followers.size;
                    console.log(`📈 Found ${followers.size} followers so far...`);
                    console.log(`📈 تاکنون ${followers.size} فالور یافت شد...`);
                }

                // Scroll down in the modal
                await this.page.evaluate(() => {
                    const modal = document.querySelector('[data-e2e="user-list"]');
                    if (modal) {
                        modal.scrollTop = modal.scrollHeight;
                    }
                });

                await this.page.waitForTimeout(this.delays.short);

            } catch (error) {
                console.log('⚠️ Error during scrolling:', error.message);
                console.log('⚠️ خطا در هنگام اسکرول:', error.message);
                break;
            }
        }

        const followerArray = Array.from(followers);
        console.log(`🏁 Extraction complete! Total real followers: ${followerArray.length}`);
        console.log(`🏁 استخراج کامل شد! مجموع فالورهای واقعی: ${followerArray.length}`);
        
        return followerArray;
    }

    async saveResults(username, followers) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `tiktok_followers_${username}_${timestamp}.txt`;
        const filepath = path.join(this.outputDir, filename);

        const content = `TikTok Followers for @${username}
Extraction Method: ChromeDriver
Extraction Date: ${new Date().toISOString()}
Total Followers: ${followers.length}
Authentication: Yes

EXTRACTION DETAILS:

Method: ChromeDriver
Session: Authenticated
Browser: ChromeDriver (Non-Headless)
Quality: Real Data Only

FOLLOWER LIST:
${followers.join('\n')}
`;

        await fs.writeFile(filepath, content, 'utf8');
        console.log(`💾 Results saved to: ${filename}`);
        console.log(`💾 نتایج در فایل ذخیره شد: ${filename}`);
        
        return filepath;
    }

    async run() {
        try {
            await this.init();

            // Load existing session or login
            const hasValidSession = await this.loadSession();
            
            if (!hasValidSession) {
                const loginSuccess = await this.login();
                if (!loginSuccess) {
                    throw new Error('Login failed - ورود ناموفق بود');
                }
            }

            // Read target accounts
            const targetFile = path.join(__dirname, 'target.txt');
            const targetAccounts = await fs.readFile(targetFile, 'utf8');
            const usernames = targetAccounts.split('\n').map(u => u.trim()).filter(u => u !== '');

            console.log(`🎯 Found ${usernames.length} target accounts`);
            console.log(`🎯 ${usernames.length} اکانت هدف یافت شد`);

            for (const username of usernames) {
                try {
                    console.log(`\n🚀 Processing @${username}...`);
                    console.log(`🚀 در حال پردازش @${username}...`);
                    
                    const followers = await this.extractFollowers(username);
                    
                    if (followers.length > 0) {
                        await this.saveResults(username, followers);
                        console.log(`✅ Successfully processed @${username}`);
                        console.log(`✅ @${username} با موفقیت پردازش شد`);
                    } else {
                        console.log(`❌ No followers found for @${username}`);
                        console.log(`❌ برای @${username} فالوری یافت نشد`);
                    }

                    // Delay between accounts
                    if (usernames.indexOf(username) < usernames.length - 1) {
                        console.log('⏳ Waiting before next account...');
                        console.log('⏳ انتظار قبل از اکانت بعدی...');
                        await this.page.waitForTimeout(this.delays.long);
                    }

                } catch (error) {
                    console.log(`❌ Error processing @${username}:`, error.message);
                    console.log(`❌ خطا در پردازش @${username}:`, error.message);
                }
            }

        } catch (error) {
            console.log('❌ Fatal error:', error.message);
            console.log('❌ خطای کشنده:', error.message);
            throw error;
        } finally {
            if (this.browser) {
                await this.browser.close();
                console.log('🔚 Browser closed');
                console.log('🔚 مرورگر بسته شد');
            }
        }
    }
}

// Main execution
async function main() {
    const extractor = new TikTokExtractor();
    await extractor.run();
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.log('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    console.log('❌ خطای مدیریت نشده:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.log('❌ Uncaught Exception:', error);
    console.log('❌ خطای گیر نیفتاده:', error);
    process.exit(1);
});

// Run the extractor
if (require.main === module) {
    main().catch(error => {
        console.log('❌ Application failed:', error);
        console.log('❌ برنامه ناموفق بود:', error);
        process.exit(1);
    });
}

module.exports = TikTokExtractor;
