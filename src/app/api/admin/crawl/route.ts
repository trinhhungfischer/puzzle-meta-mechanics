import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { auth } from '@/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) return new Response('Unauthorized', { status: 401 })

    const { searchParams } = new URL(req.url)
    const target = searchParams.get('target') === 'mobile' ? 'crawl:mobile' : 'crawl:steam'

    const stream = new ReadableStream({
      start(controller) {
        // Use shell: true on Windows to avoid ENOENT/EINVAL
        const isWindows = process.platform === 'win32'
        const child = spawn('npm', ['run', target], { shell: isWindows })

        child.stdout.on('data', (data) => {
          const text = data.toString()
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`))
        })

        child.stderr.on('data', (data) => {
          const text = data.toString()
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text, error: true })}\n\n`))
        })

        child.on('close', (code) => {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: `Process exited with code ${code}`, done: true })}\n\n`))
          controller.close()
        })
        
        child.on('error', (err) => {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: `Failed to start: ${err.message}`, error: true, done: true })}\n\n`))
          controller.close()
        })
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    })
  } catch (err: any) {
    return new Response(err.message || String(err), { status: 500 })
  }
}
