require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const DB_NAME = process.env.DB_NAME || 'raresync_db';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASSWORD || '';
const DB_HOST = process.env.DB_HOST || 'localhost';

const MYSQLDUMP = '"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe"';
const BACKUP_DIR = path.join(__dirname, '..', 'backups');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
const filename = 'raresync-backup-' + timestamp + '.sql';
const filepath = path.join(BACKUP_DIR, filename);

const command = MYSQLDUMP + ' -h ' + DB_HOST + ' -u ' + DB_USER + ' --password=' + DB_PASS + ' ' + DB_NAME + ' > "' + filepath + '"';

console.log('Starting backup...');
console.log('File: ' + filename);

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('Backup FAILED:', error.message);
    process.exit(1);
  }

  const stats = fs.statSync(filepath);
  if (stats.size < 100) {
    console.error('Backup file too small - something went wrong');
    process.exit(1);
  }

  console.log('Backup SUCCESS: ' + filename);
  console.log('Size: ' + Math.round(stats.size / 1024) + ' KB');

  const files = fs.readdirSync(BACKUP_DIR);
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  files.forEach((file) => {
    const filePath = path.join(BACKUP_DIR, file);
    const fileStat = fs.statSync(filePath);
    if (fileStat.mtimeMs < sevenDaysAgo) {
      fs.unlinkSync(filePath);
      console.log('Deleted old backup: ' + file);
    }
  });
});
