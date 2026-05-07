# Scaler Sales Support Agent

## What I Built

An AI-powered sales support tool that helps Scaler BDAs convert more leads into entrance test takers. Two core flows: (1) a **pre-sales WhatsApp nudge** that briefs the BDA on who the lead is, likely objections, and a suggested opening hook — sent before the call so the first 30 seconds aren't generic; (2) a **post-call personalised PDF** that addresses each of the lead's unanswered questions with grounded Scaler data (curriculum, placement stats, financing), previewed through a BDA approval gate (Approve / Edit / Skip) before delivery. Both flows accept structured text input or audio upload (transcribed via Groq Whisper). WhatsApp delivery uses `wa.me` deep links with the Twilio integration layer built and ready to plug in when sandbox access is configured. Built with Next.js, Groq (LLaMA 3.3 70B + Whisper), jsPDF, and deployed on Vercel.

## One Failure

When a lead's concerns are thematically similar (Meera's job guarantee + affordability), the LLM merges them into one vague section instead of addressing each distinctly. Fix: enforce strict 1:1 mapping between extracted questions and PDF sections in the prompt.

## Scale Plan

At 100K leads/month, LLM inference breaks first — each lead needs 3-4 sequential Groq calls, and rate limits would throttle within minutes. Fix: decouple PDF generation into an async job queue (BullMQ + Redis) so BDAs aren't blocked waiting. Second constraint: PDF storage costs. 100K PDFs/month on Vercel Blob gets expensive fast. Move to S3 with 30-day auto-delete lifecycle policies — these PDFs are trust-building artifacts, not permanent records.