// app/api/enquiry/route.ts
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

function createEmailHTML(data: { fullName: string; phone: string; destination: string; travelDate?: string; message?: string }) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
        <tr><td align="center">
          <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <tr>
              <td style="background:#1E3A8A;padding:28px 36px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:1px;">✈ VIMAL TRAVELS</h1>
                <p style="margin:6px 0 0;color:#93c5fd;font-size:13px;">New Enquiry Received</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 36px;">
                <h2 style="margin:0 0 20px;color:#1E3A8A;font-size:18px;">New Travel Enquiry</h2>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                      <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Full Name</span><br/>
                      <strong style="color:#0f172a;font-size:15px;">${data.fullName}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                      <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Phone Number</span><br/>
                      <strong style="font-size:15px;">
                        <a href="tel:${data.phone}" style="color:#2563EB;text-decoration:none;">${data.phone}</a>
                      </strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                      <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Destination</span><br/>
                      <strong style="color:#0f172a;font-size:15px;">🌍 ${data.destination}</strong>
                    </td>
                  </tr>
                  ${data.travelDate ? `
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                      <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Travel Date</span><br/>
                      <strong style="color:#0f172a;font-size:15px;">📅 ${data.travelDate}</strong>
                    </td>
                  </tr>` : ""}
                  ${data.message ? `
                  <tr>
                    <td style="padding:10px 0;">
                      <span style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Message</span><br/>
                      <p style="color:#334155;font-size:14px;margin:6px 0 0;line-height:1.6;">${data.message}</p>
                    </td>
                  </tr>` : ""}
                </table>
                <div style="margin-top:28px;background:#EFF6FF;border-left:4px solid #2563EB;border-radius:0 8px 8px 0;padding:14px 18px;">
                  <p style="margin:0;color:#1d4ed8;font-size:13px;">📞 Respond quickly — reply within the hour for best conversion!</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="background:#f8fafc;padding:18px 36px;text-align:center;border-top:1px solid #e2e8f0;">
                <p style="margin:0;color:#94a3b8;font-size:12px;">Vimal Travels · New BEL Rd, Bengaluru · vimaltrls@gmail.com</p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, phone, destination, travelDate, message } = body;

    if (!fullName || !phone || !destination) {
      return NextResponse.json(
        { error: "Full name, phone, and destination are required." },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Vimal Travels Website" <${process.env.EMAIL_USER}>`,
      to: "vimaltrls@gmail.com",
      subject: `✈ New Enquiry: ${destination} — ${fullName}`,
      html: createEmailHTML({ fullName, phone, destination, travelDate, message }),
    });

    return NextResponse.json(
      { success: true, message: "Enquiry submitted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Enquiry email error:", error);
    return NextResponse.json(
      { error: "Failed to send enquiry. Please try again or call us directly." },
      { status: 500 }
    );
  }
}
