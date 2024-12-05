const { execSync } = require('child_process');

try {
  execSync(`
    git init -b main . \
    && git remote add origin https://github.com/nicholaswell/wsol-discord-bot \
    && git config --global pull.ff only \
    && git pull origin main
  `);
  console.log('Git commands executed successfully.');
} catch (error) {
  console.error('An error occurred while executing Git commands:', error.message);
}