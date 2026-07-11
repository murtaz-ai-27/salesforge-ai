import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

// POST — assign a sequence to one or multiple prospects
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, sequenceId, prospectIds } = body;

    if (!userId || !sequenceId || !prospectIds?.length) {
      return NextResponse.json({ error: "userId, sequenceId, prospectIds required" }, { status: 400 });
    }

    // Get sequence
    const { data: sequence } = await supabaseAdmin
      .from("sequences").select("*").eq("id", sequenceId).single();
    if (!sequence) return NextResponse.json({ error: "Sequence not found" }, { status: 404 });

    const steps = sequence.steps ?? [];
    if (!steps.length) return NextResponse.json({ error: "Sequence has no steps" }, { status: 400 });

    // Assign sequence to each prospect + schedule first email
    const results = [];
    for (const prospectId of prospectIds) {
      const { data: prospect } = await supabaseAdmin
        .from("prospects").select("*").eq("id", prospectId).single();
      if (!prospect) continue;

      // Update prospect with sequence
      await supabaseAdmin.from("prospects")
        .update({ sequence_id: sequenceId, updated_at: new Date().toISOString() })
        .eq("id", prospectId);

      // Schedule first email (send immediately or after delay)
      const firstStep = steps[0];
      const firstName = prospect.name?.split(" ")[0] ?? prospect.name;

      // Schedule all steps
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const sendDate = new Date();
        sendDate.setDate(sendDate.getDate() + (step.day - 1));

        await supabaseAdmin.from("scheduled_followups").insert({
          user_id: userId,
          prospect_id: prospectId,
          subject: (step.subject ?? `Email #${i + 1} — ${prospect.company}`)
            .replace(/\{\{firstName\}\}/g, firstName)
            .replace(/\{\{company\}\}/g, prospect.company ?? ""),
          body: (step.body ?? "")
            .replace(/\{\{firstName\}\}/g, firstName)
            .replace(/\{\{company\}\}/g, prospect.company ?? ""),
          scheduled_at: sendDate.toISOString(),
          touch_number: i + 1,
          angle: step.type ?? "email",
          status: "pending",
        });
      }

      results.push({ prospectId, name: prospect.name, stepsScheduled: steps.length });
    }

    // Update sequence prospect count
    await supabaseAdmin.from("sequences")
      .update({
        prospect_count: (sequence.prospect_count ?? 0) + prospectIds.length,
        status: "active",
        updated_at: new Date().toISOString()
      })
      .eq("id", sequenceId);

    return NextResponse.json({
      success: true,
      assigned: results.length,
      message: `Sequence assigned to ${results.length} prospect(s). ${steps.length} emails scheduled per prospect.`,
      results,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET — get prospects assigned to a sequence
export async function GET(req: NextRequest) {
  try {
    const sequenceId = req.nextUrl.searchParams.get("sequenceId");
    const userId = req.nextUrl.searchParams.get("userId");
    if (!sequenceId || !userId) return NextResponse.json({ error: "sequenceId and userId required" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("prospects").select("*")
      .eq("user_id", userId).eq("sequence_id", sequenceId)
      .order("ai_score", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ prospects: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
