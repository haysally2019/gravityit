import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (leadError) throw leadError;

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    const nameParts = lead.name.split(" ");
    const contactData = {
      first_name: nameParts[0] || "",
      last_name: nameParts.slice(1).join(" ") || "",
      email: lead.email || "",
      phone: lead.phone || "",
      from_lead_id: id,
      status: "new",
      source: "lead_conversion",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .insert([contactData])
      .select()
      .single();

    if (contactError) throw contactError;

    await supabase
      .from("leads")
      .update({ status: "converted", updated_at: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Error converting lead:", error);
    return NextResponse.json(
      { error: "Failed to convert lead" },
      { status: 500 }
    );
  }
}
