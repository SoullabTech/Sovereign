import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'deploy':
        // Trigger the deployment script
        const deployCommand = 'cd /Users/soullab/MAIA-PAI/apps/web && /Users/soullab/MAIA-PAI/apps/web/deploy.sh';
        const { stdout: deployOutput, stderr: deployError } = await execAsync(deployCommand, {
          timeout: 120000, // 2 minute timeout for build
        });

        return NextResponse.json({
          success: true,
          message: 'Deployment triggered successfully',
          output: deployOutput,
        });

      case 'restart-maia':
        await execAsync('pm2 restart maia-sovereign');
        return NextResponse.json({
          success: true,
          message: 'MAIA restarted successfully',
        });

      case 'restart-tunnel':
        await execAsync('pm2 restart cloudflare-tunnel');
        return NextResponse.json({
          success: true,
          message: 'Cloudflare tunnel restarted successfully',
        });

      case 'restart-all':
        await execAsync('pm2 restart all');
        return NextResponse.json({
          success: true,
          message: 'All services restarted successfully',
        });

      case 'save-pm2':
        await execAsync('pm2 save');
        return NextResponse.json({
          success: true,
          message: 'PM2 configuration saved',
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Deployment action failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Deployment failed',
        output: error.stdout || '',
        stderr: error.stderr || '',
      },
      { status: 500 }
    );
  }
}
