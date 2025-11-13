import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { campaignId, contactId, stage, template, campaignContactId } = body;

    if (!campaignContactId && !contactId) {
      return NextResponse.json(
        { error: "Either campaignContactId or contactId is required" },
        { status: 400 }
      );
    }

    let finalCampaignContactId = campaignContactId;

    if (!finalCampaignContactId && contactId && campaignId) {
      const { data: existingLink } = await supabase
        .from("campaign_contacts")
        .select("id")
        .eq("campaign_id", campaignId)
        .eq("contact_id", contactId)
        .maybeSingle();

      if (existingLink) {
        finalCampaignContactId = existingLink.id;
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
        finalCampaignContactId = newLink.id;
      }
    }

    const messageData = {
      campaign_contact_id: finalCampaignContactId,
      direction: "outbound" as const,
      content: template || "Outreach message sent",
      sent_at: new Date().toISOString(),
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
        sent_at: new Date().toISOString(),
      })
      .eq("id", finalCampaignContactId);

    if (contactId) {
      await supabase
        .from("contacts")
        .update({
          status: "contacted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", contactId);
    }

    return NextResponse.json({
      ok: true,
      message,
      campaignContactId: finalCampaignContactId,
    });
  } catch (error) {
    console.error("Error sending outreach:", error);
    return NextResponse.json(
      { error: "Failed to send outreach message" },
      { status: 500 }
    );
  }
}
