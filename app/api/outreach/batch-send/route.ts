import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, contactIds, template, stage } = body;

    if (!campaignId || !contactIds || !Array.isArray(contactIds)) {
      return NextResponse.json(
        { error: "campaignId and contactIds array are required" },
        { status: 400 }
      );
    }

    const results = [];
    const timestamp = new Date().toISOString();

    for (const contactId of contactIds) {
      try {
        const { data: existingLink } = await supabase
          .from("campaign_contacts")
          .select("id")
          .eq("campaign_id", campaignId)
          .eq("contact_id", contactId)
          .maybeSingle();

        let campaignContactId;

        if (existingLink) {
          campaignContactId = existingLink.id;
        } else {
          const { data: newLink, error: linkError } = await supabase
            .from("campaign_contacts")
            .insert([
              {
                campaign_id: campaignId,
                contact_id: contactId,
                status: "pending",
              },
            ])
            .select()
            .single();

          if (linkError) throw linkError;
          campaignContactId = newLink.id;
        }

        const messageData = {
          campaign_contact_id: campaignContactId,
          direction: "outbound" as const,
          content: template || `Outreach message sent - Stage: ${stage || "initial"}`,
          sent_at: timestamp,
        };

        const { data: message, error: messageError } = await supabase
          .from("messages")
          .insert([messageData])
          .select()
          .single();

        if (messageError) throw messageError;

        await supabase
          .from("campaign_contacts")
          .update({
            status: "sent",
            sent_at: timestamp,
          })
          .eq("id", campaignContactId);

        await supabase
          .from("contacts")
          .update({
            status: "contacted",
            updated_at: timestamp,
          })
          .eq("id", contactId);

        results.push({
          contactId,
          success: true,
          messageId: message.id,
        });
      } catch (error) {
        console.error(`Error sending to contact ${contactId}:`, error);
        results.push({
          contactId,
          success: false,
          error: "Failed to send message",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      ok: true,
      total: contactIds.length,
      successful: successCount,
      failed: failureCount,
      results,
    });
  } catch (error) {
    console.error("Error in batch send:", error);
    return NextResponse.json(
      { error: "Failed to send batch outreach" },
      { status: 500 }
    );
  }
}
