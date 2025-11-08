import { createPVEUser } from "@/lib/users/pve";

export async function GET() {
  await createPVEUser("cmghd1nos000004l8f7jrgwis", ["/vms/800", "/vms/801"]);
  return new Response("User created");
}