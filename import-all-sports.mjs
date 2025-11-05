import { spawn } from 'child_process';

const sports = [
  { name: 'NFL', script: './import-nfl.mjs' },
  { name: 'CFB', script: './import-cfb.mjs' },
  { name: 'MLB', script: './import-mlb.mjs' },
  { name: 'NBA', script: './import-nba.mjs' },
  { name: 'UFC', script: './import-ufc.mjs' },
  { name: 'Golf', script: './import-golf.mjs' }
];

async function runImport(sport) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Starting ${sport.name} import...`);
    console.log('='.repeat(60));

    const child = spawn('node', [sport.script], {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${sport.name} import completed successfully\n`);
        resolve();
      } else {
        console.error(`\n❌ ${sport.name} import failed with code ${code}\n`);
        reject(new Error(`${sport.name} import failed`));
      }
    });

    child.on('error', (err) => {
      console.error(`\n❌ Error running ${sport.name} import:`, err.message);
      reject(err);
    });
  });
}

async function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       SPORTS DATA IMPORT - ALL SPORTS (2020-Present)      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log('This will import historical data for:');
  sports.forEach(s => console.log(`  • ${s.name}`));
  console.log('\n');
  console.log('⚠️  WARNING: This process will take several hours to complete.');
  console.log('⚠️  Make sure you have a stable internet connection.');
  console.log('⚠️  The scripts will automatically handle rate limiting.\n');

  const startTime = Date.now();

  for (const sport of sports) {
    try {
      await runImport(sport);
      // Wait 5 seconds between sports
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (err) {
      console.error(`Failed to import ${sport.name}, continuing with next sport...`);
    }
  }

  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000 / 60);

  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    ALL IMPORTS COMPLETE                    ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\n⏱️  Total time: ${duration} minutes\n`);
}

main().catch(console.error);
