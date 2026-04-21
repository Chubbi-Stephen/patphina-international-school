const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const archiver = require('archiver');
const db = require('../db/database'); // This gets the exported instance

const backupDir = path.join(__dirname, '../../backups');

function createBackup() {
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
  const tempDbPath = path.join(backupDir, `temp-${dateStr}.db`);
  const zipPath = path.join(backupDir, `patphina-backup-${dateStr}.zip`);

  console.log(`\n[Backup] Starting daily database backup...`);

  // db.backup() safely copies the live WAL database to a single file without blocking reads/writes
  db.backup(tempDbPath).then(() => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } }); // Max compression

    output.on('close', () => {
      console.log(`[Backup] Success! Saved to: ${zipPath}`);
      fs.unlinkSync(tempDbPath); // Cleanup raw file
    });

    archive.on('error', (err) => { throw err; });
    archive.pipe(output);
    archive.file(tempDbPath, { name: 'patphina.db' });
    archive.finalize();
  }).catch(err => {
    console.error(`[Backup] Failed:`, err);
  });
}

// Schedule cron job: Every day at 2:00 AM
cron.schedule('0 2 * * *', () => {
    createBackup();
});

module.exports = { createBackup };
