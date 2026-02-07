import { NextRequest, NextResponse } from 'next/server';
import {
  DEFAULT_LAYOUT_CONFIG,
  getAlignmentParams,
  generateCalendarPdfBytes,
} from '@calendar-lib/index';
import { createResvgRenderer, loadBundledFont } from '@calendar-renderers/index';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface RequestBody {
  gregorianDate?: string;
  hijriDate?: {
    hijriYear: number;
    hijriMonth: number;
    hijriDay: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json().catch(() => ({}));

    // Parse date (optional)
    let alignment;
    if (body.hijriDate) {
      alignment = getAlignmentParams(undefined, body.hijriDate);
    } else if (body.gregorianDate) {
      alignment = getAlignmentParams(new Date(body.gregorianDate));
    } else {
      alignment = getAlignmentParams(); // Default: today
    }

    // Load bundled font for serverless environment (no system fonts available)
    const fontData = await loadBundledFont();

    const renderer = createResvgRenderer({ dpi: 600, fontData });
    const pdfBytes = await generateCalendarPdfBytes({
      config: DEFAULT_LAYOUT_CONFIG,
      alignment,
      renderer,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="circle-calendar.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
