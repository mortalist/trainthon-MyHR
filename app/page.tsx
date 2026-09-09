import { ContactList } from "@/components/contact-list";
import { listPeople } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  return <ContactList people={await listPeople()} />;
}
